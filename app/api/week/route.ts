import { NextResponse } from 'next/server'
import * as ical from 'node-ical'
import { startOfWeek, endOfWeek, addWeeks, addDays } from 'date-fns'
import type { CalEvent } from '@/lib/types'

export const runtime = 'nodejs'

const SOURCES = [
  { envKey: 'HOME_HQ_ICAL_URL', source: 'home'  as const, label: 'Home HQ' },
  { envKey: 'NANNY_ICAL_URL',   source: 'nanny' as const, label: 'Riley'   },
]

// For all-day events use UTC date string to avoid timezone shifts
function utcDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const weekOffset = parseInt(searchParams.get('week') ?? '0', 10)

  const base      = addWeeks(new Date(), weekOffset)
  const weekStart = startOfWeek(base, { weekStartsOn: 0 })
  const weekEnd   = endOfWeek(base,   { weekStartsOn: 0 })

  const events: CalEvent[] = []

  for (const { envKey, source, label } of SOURCES) {
    const url = process.env[envKey]
    if (!url) continue

    try {
      const res  = await fetch(url, { next: { revalidate: 900 } })
      const text = await res.text()
      const data = ical.sync.parseICS(text)

      for (const component of Object.values(data)) {
        if (!component || component.type !== 'VEVENT') continue

        // Cast to VEvent after the type guard above
        const event = component as ical.VEvent

        const summary  = String(event.summary ?? 'Untitled').trim()
        const evStart  = new Date(event.start)
        const evEnd    = event.end ? new Date(event.end) : addDays(evStart, 1)
        const duration = evEnd.getTime() - evStart.getTime()
        const allDay   = (event as any).datetype === 'date'

        const makeEvent = (start: Date, id: string): CalEvent => {
          const end = new Date(start.getTime() + duration)
          return {
            id,
            summary,
            start: allDay ? utcDateStr(start) : start.toISOString(),
            end:   allDay ? utcDateStr(end)   : end.toISOString(),
            allDay,
            source,
            label,
          }
        }

        const rrule = (event as any).rrule
        if (rrule?.between) {
          // Recurring — expand for this week
          const occurrences: Date[] = rrule.between(weekStart, weekEnd, true)
          const exdates = (event as any).exdate ?? {}
          const excluded = new Set(
            Object.values(exdates).map((d: any) => new Date(d as Date).toISOString().slice(0, 10))
          )
          for (const occ of occurrences) {
            if (excluded.has(occ.toISOString().slice(0, 10))) continue
            events.push(makeEvent(occ, `${event.uid}-${occ.toISOString()}`))
          }
        } else {
          // Single event — check if it overlaps this week
          if (evStart <= weekEnd && evEnd > weekStart) {
            events.push(makeEvent(evStart, String(event.uid ?? `${source}-${evStart.toISOString()}`)))
          }
        }
      }
    } catch (err) {
      console.error(`[week/route] Failed to load ${envKey}:`, err)
    }
  }

  events.sort((a, b) => a.start.localeCompare(b.start))

  return NextResponse.json({
    events,
    weekStart: weekStart.toISOString(),
    weekEnd:   weekEnd.toISOString(),
  })
}

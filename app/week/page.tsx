'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/AppShell'
import { useChores } from '@/lib/hooks/useChores'
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { addWeeks, startOfWeek, addDays, format, isToday, isSameDay, isBefore, startOfDay } from 'date-fns'
import type { Chore, CalEvent } from '@/lib/types'
import clsx from 'clsx'

const SOURCE_STYLE: Record<string, { pill: string; border: string }> = {
  home:  { pill: 'bg-sky-100 text-sky-700',      border: 'border-l-sky-400'    },
  nanny: { pill: 'bg-violet-100 text-violet-700', border: 'border-l-violet-400' },
}

export default function WeekPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [events, setEvents]         = useState<CalEvent[]>([])
  const [calLoading, setCalLoading] = useState(true)
  const { chores } = useChores()

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 0 })
  const days      = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayStart = startOfDay(new Date())

  useEffect(() => {
    setCalLoading(true)
    setEvents([])
    fetch(`/api/week?week=${weekOffset}`)
      .then(r => r.json())
      .then(d => setEvents(d.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setCalLoading(false))
  }, [weekOffset])

  // Pending chores overdue as of today (only on current week view)
  const overdueChores = weekOffset === 0
    ? chores.filter(c => c.completedAt === null && isBefore(c.nextDueDate, todayStart))
    : []

  function eventsForDay(day: Date): CalEvent[] {
    const dayStr = format(day, 'yyyy-MM-dd')
    return events
      .filter(e => {
        if (e.allDay) return e.start <= dayStr && e.end > dayStr
        return isSameDay(new Date(e.start), day)
      })
      .sort((a, b) => {
        if (a.allDay && !b.allDay) return -1
        if (!a.allDay && b.allDay) return 1
        return a.start.localeCompare(b.start)
      })
  }

  function choresForDay(day: Date): Chore[] {
    return chores.filter(c => c.completedAt === null && isSameDay(c.nextDueDate, day))
  }

  return (
    <AppShell title="This Week">
      <div className="px-4 py-4 space-y-3">

        {/* ── Week navigation ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <p className="text-sm font-semibold text-gray-800">
                {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </p>
              {calLoading && (
                <div className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            {weekOffset === 0 && <p className="text-xs text-brand-600 font-medium">This week</p>}
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="text-xs text-brand-600 underline">
                Back to today
              </button>
            )}
          </div>

          <button
            onClick={() => setWeekOffset(o => o + 1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Past-due chores ── */}
        {overdueChores.length > 0 && (
          <div className="card p-0 overflow-hidden border-l-4 border-l-red-400">
            <div className="px-4 py-2 bg-red-50 border-b border-red-100">
              <p className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Past due</p>
            </div>
            <div className="divide-y divide-gray-50">
              {overdueChores.map(c => <ChoreRow key={c.id} chore={c} overdue />)}
            </div>
          </div>
        )}

        {/* ── Day cards ── */}
        {days.map(day => {
          const today     = isToday(day)
          const past      = isBefore(day, todayStart) && !today
          const dayEvents = eventsForDay(day)
          const dayChores = choresForDay(day)
          const count     = dayEvents.length + dayChores.length

          return (
            <div
              key={day.toISOString()}
              className={clsx(
                'card p-0 overflow-hidden',
                today && 'ring-2 ring-brand-500',
                past   && 'opacity-40',
              )}
            >
              {/* Day header */}
              <div className={clsx(
                'px-4 py-2 flex items-center gap-2 border-b',
                today ? 'bg-brand-600 border-brand-700' : 'bg-gray-50 border-gray-100',
              )}>
                <span className={clsx(
                  'text-xs font-bold tracking-widest',
                  today ? 'text-white' : 'text-gray-500',
                )}>
                  {format(day, 'EEE').toUpperCase()}
                </span>
                <span className={clsx('text-xs', today ? 'text-brand-200' : 'text-gray-400')}>
                  {format(day, 'MMM d')}
                </span>
                {today && (
                  <span className="ml-auto text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold tracking-wide">
                    TODAY
                  </span>
                )}
                {!today && count > 0 && (
                  <span className="ml-auto text-[10px] text-gray-300 font-medium">{count}</span>
                )}
              </div>

              {/* Events + chores */}
              {count > 0 ? (
                <div className="divide-y divide-gray-50">
                  {dayEvents.map(e => <EventRow key={e.id} event={e} />)}
                  {dayChores.map(c => <ChoreRow  key={c.id} chore={c} />)}
                </div>
              ) : (
                <p className="px-4 py-2.5 text-xs text-gray-300 italic">Nothing scheduled</p>
              )}
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}

function EventRow({ event }: { event: CalEvent }) {
  const style   = SOURCE_STYLE[event.source] ?? SOURCE_STYLE.home
  const timeStr = event.allDay ? 'All day' : format(new Date(event.start), 'h:mm a')

  return (
    <div className={clsx('flex items-center gap-3 px-4 py-2.5 border-l-[3px]', style.border)}>
      <span className="w-14 flex-shrink-0 text-right text-[11px] text-gray-400 font-medium">
        {timeStr}
      </span>
      <p className="flex-1 min-w-0 text-sm text-gray-800 truncate">{event.summary}</p>
      <span className={clsx('flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full', style.pill)}>
        {event.label}
      </span>
    </div>
  )
}

function ChoreRow({ chore, overdue = false }: { chore: Chore; overdue?: boolean }) {
  return (
    <div className={clsx(
      'flex items-center gap-3 px-4 py-2.5 border-l-[3px]',
      overdue ? 'border-l-red-400' : 'border-l-amber-300',
    )}>
      <span className="w-14 flex-shrink-0 flex justify-end">
        <CheckCircleIcon className={clsx('w-4 h-4', overdue ? 'text-red-400' : 'text-amber-400')} />
      </span>
      <p className="flex-1 min-w-0 text-sm text-gray-700 truncate">{chore.name}</p>
      <span className={clsx(
        'flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
        overdue ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600',
      )}>
        {chore.assignedToName ?? 'Chore'}
      </span>
    </div>
  )
}

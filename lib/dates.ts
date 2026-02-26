import { addDays, addWeeks, addMonths, setDate, nextDay } from 'date-fns'
import type { Chore, ChoreFrequency } from './types'

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** Calculate the next due date after a chore is completed. */
export function calcNextDueDate(chore: Pick<Chore, 'frequency' | 'dayOfWeek' | 'dayOfMonth' | 'intervalDays'>): Date {
  const now = new Date()

  switch (chore.frequency) {
    case 'weekly': {
      const day = (chore.dayOfWeek ?? 0) as DayOfWeek
      return nextDay(now, day)
    }
    case 'monthly': {
      const dom = chore.dayOfMonth ?? 1
      const next = addMonths(now, 1)
      return setDate(next, Math.min(dom, 28))
    }
    case 'custom': {
      const interval = chore.intervalDays ?? 7
      return addDays(now, interval)
    }
    case 'once':
    default:
      return now
  }
}

export function isDueOrOverdue(dueDate: Date): boolean {
  return dueDate <= new Date()
}

export function formatDueDate(dueDate: Date): string {
  const now = new Date()
  const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  return `Due in ${diff}d`
}

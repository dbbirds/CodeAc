'use client'

import clsx from 'clsx'
import { formatDueDate, isDueOrOverdue } from '@/lib/dates'
import { Badge } from '@/components/ui/Badge'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import type { Chore, AppUser } from '@/lib/types'

interface ChoreItemProps {
  chore: Chore
  user: AppUser
  onComplete: (chore: Chore) => void
  onUncomplete: (chore: Chore) => void
  onEdit: (chore: Chore) => void
}

const FREQ_LABELS: Record<string, string> = {
  once: 'One-time', weekly: 'Weekly', monthly: 'Monthly', custom: 'Custom',
}

export function ChoreItem({ chore, user, onComplete, onUncomplete, onEdit }: ChoreItemProps) {
  const isDone    = chore.completedAt !== null
  const isOverdue = !isDone && isDueOrOverdue(chore.nextDueDate)

  // For recurring chores, "done" means completed after the last reset
  const showAsDone = isDone && chore.frequency === 'once'
    ? true
    : isDone

  return (
    <div className={clsx('card flex items-start gap-3', showAsDone && 'opacity-60')}>
      {/* Checkbox */}
      <button
        onClick={() => showAsDone ? onUncomplete(chore) : onComplete(chore)}
        className={clsx(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 transition-colors flex items-center justify-center',
          showAsDone
            ? 'bg-green-500 border-green-500'
            : isOverdue
              ? 'border-red-400 hover:border-red-500'
              : 'border-gray-300 hover:border-brand-500'
        )}
        aria-label={showAsDone ? 'Mark incomplete' : 'Mark complete'}
      >
        {showAsDone && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium', showAsDone && 'line-through text-gray-400')}>
          {chore.name}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <Badge label={FREQ_LABELS[chore.frequency]} variant="gray" />

          {chore.assignedToName && (
            <Badge label={chore.assignedToName === user.displayName ? 'You' : chore.assignedToName} variant="blue" />
          )}

          {showAsDone ? (
            <span className="text-xs text-gray-400">
              Done by {chore.completedByName === user.displayName ? 'you' : chore.completedByName}
            </span>
          ) : (
            <span className={clsx('text-xs', isOverdue ? 'text-red-500 font-medium' : 'text-gray-400')}>
              {formatDueDate(chore.nextDueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Edit */}
      <button
        onClick={() => onEdit(chore)}
        className="flex-shrink-0 p-1 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
        aria-label="Edit chore"
      >
        <PencilSquareIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

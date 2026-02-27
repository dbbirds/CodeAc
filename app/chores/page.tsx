'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { ChoreItem } from '@/components/chores/ChoreItem'
import { AddChoreModal } from '@/components/chores/AddChoreModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChores } from '@/lib/hooks/useChores'
import { useAuth } from '@/lib/hooks/useAuth'
import { CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline'
import type { Chore } from '@/lib/types'

export default function ChoresPage() {
  const { user } = useAuth()
  const { chores, loading, addChore, completeChore, uncompleteChore } = useChores()
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'mine' | 'done'>('all')



  const pending = chores.filter(c => c.completedAt === null)
  const done    = chores.filter(c => c.completedAt !== null)

  const visible = filter === 'done'
    ? done
    : filter === 'mine'
      ? pending.filter(c => !c.assignedTo || c.assignedTo === user?.uid)
      : pending

  return (
    <AppShell title="Chores">
      <div className="px-4 py-4 space-y-4">
        {/* Filter pills */}
        <div className="flex gap-2">
          {(['all', 'mine', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {f === 'all' ? `All (${pending.length})` : f === 'mine' ? 'Mine' : `Done (${done.length})`}
            </button>
          ))}
        </div>

        {/* Chore list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-16 animate-pulse bg-gray-50" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<CheckCircleIcon className="w-16 h-16" />}
            title={filter === 'done' ? 'Nothing done yet' : 'All caught up!'}
            description={
              filter === 'done'
                ? 'Complete a chore to see it here.'
                : 'No pending chores. Add one to get started.'
            }
            action={
              filter !== 'done' && (
                <button onClick={() => setModalOpen(true)} className="btn-primary">
                  Add chore
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {visible.map(chore => (
              <ChoreItem
                key={chore.id}
                chore={chore}
                user={user}
                onComplete={(c: Chore) => completeChore(c, user)}
                onUncomplete={uncompleteChore}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed right-4 bottom-24 z-30 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg
                   flex items-center justify-center hover:bg-brand-700 active:bg-brand-800 transition-colors"
        aria-label="Add chore"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

      <AddChoreModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addChore}
        user={user}
        users={[]}
      />
    </AppShell>
  )
}

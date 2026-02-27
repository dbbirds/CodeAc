'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { AddGroceryModal } from '@/components/groceries/AddGroceryModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { useGroceries } from '@/lib/hooks/useGroceries'
import { useAuth } from '@/lib/hooks/useAuth'
import { ShoppingCartIcon, PlusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import type { GroceryItem } from '@/lib/types'
import clsx from 'clsx'

const CATEGORY_COLORS: Record<string, 'green' | 'blue' | 'red' | 'yellow' | 'gray' | 'purple'> = {
  Produce: 'green', Dairy: 'blue', Meat: 'red', Bakery: 'yellow',
  Pantry: 'gray', Frozen: 'blue', Beverages: 'purple', Household: 'gray', Other: 'gray',
}

export default function GroceriesPage() {
  const { user } = useAuth()
  const { items, loading, addItem, markBought, markUnbought, clearBoughtItems } = useGroceries()
  const [modalOpen, setModalOpen] = useState(false)
  const [clearing, setClearing]  = useState(false)

  const pending = items.filter(i => i.boughtAt === null)
  const bought  = items.filter(i => i.boughtAt !== null)

  // Group pending by category
  const grouped = pending.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    const key = item.category ?? 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  async function handleClear() {
    if (!bought.length) return
    setClearing(true)
    try { await clearBoughtItems(items) }
    finally { setClearing(false) }
  }

  return (
    <AppShell title="Groceries">
      <div className="px-4 py-4 space-y-6">
        {/* Pending items */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="card h-14 animate-pulse bg-gray-50" />)}
          </div>
        ) : pending.length === 0 && bought.length === 0 ? (
          <EmptyState
            icon={<ShoppingCartIcon className="w-16 h-16" />}
            title="List is empty"
            description="Add items you need to pick up."
            action={<button onClick={() => setModalOpen(true)} className="btn-primary">Add item</button>}
          />
        ) : (
          <>
            {/* Pending grouped by category */}
            {Object.keys(grouped).sort().map(category => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{category}</h3>
                <div className="space-y-2">
                  {grouped[category].map(item => (
                    <GroceryRow
                      key={item.id}
                      item={item}
                      onCheck={() => markBought(item, user!)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Bought section */}
            {bought.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    In cart ({bought.length})
                  </h3>
                  <button
                    onClick={handleClear}
                    disabled={clearing}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {clearing ? (
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <TrashIcon className="w-3.5 h-3.5" />
                    )}
                    Clear bought
                  </button>
                </div>
                <div className="space-y-2">
                  {bought.map(item => (
                    <GroceryRow
                      key={item.id}
                      item={item}
                      onCheck={() => markUnbought(item)}
                      bought
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed right-4 bottom-24 z-30 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg
                   flex items-center justify-center hover:bg-brand-700 active:bg-brand-800 transition-colors"
        aria-label="Add item"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

      <AddGroceryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addItem}
        user={user!}
      />
    </AppShell>
  )
}

function GroceryRow({
  item,
  onCheck,
  bought = false,
}: {
  item: GroceryItem
  onCheck: () => void
  bought?: boolean
}) {
  return (
    <div
      className={clsx('card flex items-center gap-3', bought && 'opacity-50')}
      onClick={onCheck}
    >
      <button
        className={clsx(
          'flex-shrink-0 w-6 h-6 rounded border-2 transition-colors flex items-center justify-center',
          bought
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-brand-500'
        )}
        aria-label={bought ? 'Mark not bought' : 'Mark bought'}
      >
        {bought && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium', bought && 'line-through text-gray-400')}>
          {item.name}
          {item.quantity && <span className="text-gray-400 font-normal ml-1">· {item.quantity}</span>}
        </p>
        {item.recurring && <span className="text-xs text-brand-500">↻ recurring</span>}
      </div>
      {item.category && (
        <Badge
          label={item.category}
          variant={CATEGORY_COLORS[item.category] ?? 'gray'}
        />
      )}
    </div>
  )
}

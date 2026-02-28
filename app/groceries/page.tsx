'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { AddGroceryModal } from '@/components/groceries/AddGroceryModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useGroceries } from '@/lib/hooks/useGroceries'
import { useAuth } from '@/lib/hooks/useAuth'
import { ShoppingCartIcon, PlusIcon, TrashIcon, ArrowPathIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import type { GroceryItem } from '@/lib/types'
import clsx from 'clsx'

const STORES = ['Hannaford', 'Healthy Living', 'Costco']

export default function GroceriesPage() {
  const { user } = useAuth()
  const { items, loading, addItem, markBought, markUnbought, clearBoughtItems } = useGroceries()
  const [modalOpen, setModalOpen]     = useState(false)
  const [modalStore, setModalStore]   = useState<string | undefined>(undefined)
  const [collapsed, setCollapsed]     = useState<Record<string, boolean>>({})
  const [clearing, setClearing]       = useState(false)

  const pending = items.filter(i => i.boughtAt === null)
  const bought  = items.filter(i => i.boughtAt !== null)

  function openModalFor(store?: string) {
    setModalStore(store)
    setModalOpen(true)
  }

  function toggleCollapse(store: string) {
    setCollapsed(prev => ({ ...prev, [store]: !prev[store] }))
  }

  async function handleClear() {
    if (!bought.length) return
    setClearing(true)
    try { await clearBoughtItems(items) }
    finally { setClearing(false) }
  }

  const isEmpty = pending.length === 0 && bought.length === 0

  return (
    <AppShell title="Groceries">
      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="card h-14 animate-pulse bg-gray-50" />)}
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={<ShoppingCartIcon className="w-16 h-16" />}
            title="List is empty"
            description="Add items you need to pick up."
            action={<button onClick={() => openModalFor(undefined)} className="btn-primary">Add item</button>}
          />
        ) : (
          <>
            {STORES.map(store => {
              const storeItems = pending.filter(i => i.store === store)
              const isCollapsed = !!collapsed[store]
              return (
                <div key={store} className="card overflow-hidden p-0">
                  {/* Store header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <button
                      onClick={() => toggleCollapse(store)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      {isCollapsed
                        ? <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        : <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      }
                      <span className="font-semibold text-gray-800 text-sm">{store}</span>
                      <span className="text-xs text-gray-400 ml-1">({storeItems.length})</span>
                    </button>
                    <button
                      onClick={() => openModalFor(store)}
                      className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-100 transition-colors"
                      aria-label={`Add item to ${store}`}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Store items */}
                  {!isCollapsed && (
                    <div className="divide-y divide-gray-50">
                      {storeItems.length === 0 ? (
                        <p className="text-sm text-gray-400 px-4 py-3 italic">Nothing here yet</p>
                      ) : (
                        storeItems.map(item => (
                          <GroceryRow
                            key={item.id}
                            item={item}
                            onCheck={() => markBought(item, user!)}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Items with no store assigned */}
            {(() => {
              const unassigned = pending.filter(i => !i.store || !STORES.includes(i.store))
              if (unassigned.length === 0) return null
              const isCollapsed = !!collapsed['__other__']
              return (
                <div className="card overflow-hidden p-0">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <button
                      onClick={() => toggleCollapse('__other__')}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      {isCollapsed
                        ? <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        : <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      }
                      <span className="font-semibold text-gray-800 text-sm">Other</span>
                      <span className="text-xs text-gray-400 ml-1">({unassigned.length})</span>
                    </button>
                  </div>
                  {!isCollapsed && (
                    <div className="divide-y divide-gray-50">
                      {unassigned.map(item => (
                        <GroceryRow key={item.id} item={item} onCheck={() => markBought(item, user!)} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* In cart */}
            {bought.length > 0 && (
              <div className="card overflow-hidden p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <button
                    onClick={() => toggleCollapse('__bought__')}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {!!collapsed['__bought__']
                      ? <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      : <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    }
                    <span className="font-semibold text-gray-800 text-sm">In cart</span>
                    <span className="text-xs text-gray-400 ml-1">({bought.length})</span>
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={clearing}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {clearing
                      ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                      : <TrashIcon className="w-3.5 h-3.5" />
                    }
                    Clear
                  </button>
                </div>
                {!collapsed['__bought__'] && (
                  <div className="divide-y divide-gray-50">
                    {bought.map(item => (
                      <GroceryRow key={item.id} item={item} onCheck={() => markUnbought(item)} bought />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => openModalFor(undefined)}
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
        defaultStore={modalStore}
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
      className={clsx('flex items-center gap-3 px-4 py-3', bought && 'opacity-50')}
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
        <span className="text-xs text-gray-400">{item.category}</span>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/AppShell'
import { AddGroceryModal } from '@/components/groceries/AddGroceryModal'
import { EditGroceryModal } from '@/components/groceries/EditGroceryModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useGroceries } from '@/lib/hooks/useGroceries'
import { useAuth } from '@/lib/hooks/useAuth'
import { ShoppingCartIcon, PlusIcon, TrashIcon, ArrowPathIcon, ChevronDownIcon, ChevronRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import type { GroceryItem } from '@/lib/types'
import clsx from 'clsx'

const STORES = ['Hannaford', 'Healthy Living', 'Costco']
const CATEGORY_ORDER = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Household', 'Other']

function sortByCategory(items: GroceryItem[]) {
  return [...items].sort((a, b) => {
    const ai = a.category ? CATEGORY_ORDER.indexOf(a.category) : CATEGORY_ORDER.length
    const bi = b.category ? CATEGORY_ORDER.indexOf(b.category) : CATEGORY_ORDER.length
    if (ai !== bi) return ai - bi
    return a.name.localeCompare(b.name)
  })
}

export default function GroceriesPage() {
  const { user } = useAuth()
  const { items, loading, addItem, updateItem, deleteItem, markBought, markUnbought, clearBoughtItems } = useGroceries()
  const [modalOpen, setModalOpen]     = useState(false)
  const [modalStore, setModalStore]   = useState<string | undefined>(undefined)
  const [editItem, setEditItem]       = useState<GroceryItem | null>(null)
  const [collapsed, setCollapsed]     = useState<Record<string, boolean>>({})
  const [clearing, setClearing]       = useState(false)

  const pending = items.filter(i => i.boughtAt === null)
  const bought  = items.filter(i => i.boughtAt !== null)

  // Auto-clear bought items older than 3 hours when the list loads/updates
  useEffect(() => {
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000
    const now = Date.now()
    const stale = bought.filter(i => i.boughtAt && now - i.boughtAt.getTime() > THREE_HOURS_MS)
    if (stale.length > 0) clearBoughtItems(stale)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

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
              const storeItems = sortByCategory(pending.filter(i => i.store === store))
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
                            onEdit={() => setEditItem(item)}
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
              const unassigned = sortByCategory(pending.filter(i => !i.store || !STORES.includes(i.store)))
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
                        <GroceryRow key={item.id} item={item} onCheck={() => markBought(item, user!)} onEdit={() => setEditItem(item)} />
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
                      <GroceryRow key={item.id} item={item} onCheck={() => markUnbought(item)} onEdit={() => setEditItem(item)} bought />
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

      <EditGroceryModal
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={updateItem}
        onDelete={deleteItem}
      />
    </AppShell>
  )
}

function GroceryRow({
  item,
  onCheck,
  onEdit,
  bought = false,
}: {
  item: GroceryItem
  onCheck: () => void
  onEdit: () => void
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
        <span className="text-xs text-gray-400 mr-1">{item.category}</span>
      )}
      <button
        onClick={e => { e.stopPropagation(); onEdit() }}
        className="flex-shrink-0 p-1 text-gray-300 hover:text-gray-500 transition-colors"
        aria-label="Edit item"
      >
        <PencilSquareIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

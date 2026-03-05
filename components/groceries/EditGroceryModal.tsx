'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { CATEGORIES, STORES, guessCategory } from '@/lib/groceryCategories'
import type { GroceryItem } from '@/lib/types'

interface EditGroceryModalProps {
  item: GroceryItem | null
  onClose: () => void
  onSave: (id: string, data: { name: string; quantity?: string; category?: string; store?: string; recurring: boolean }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function EditGroceryModal({ item, onClose, onSave, onDelete }: EditGroceryModalProps) {
  const [name, setName]                     = useState('')
  const [quantity, setQuantity]             = useState('')
  const [category, setCategory]             = useState('')
  const [categoryLocked, setCategoryLocked] = useState(false)
  const [store, setStore]                   = useState('')
  const [recurring, setRecurring]           = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [deleting, setDeleting]             = useState(false)
  const [confirmDelete, setConfirmDelete]   = useState(false)

  // Populate fields when a different item is opened
  useEffect(() => {
    if (item) {
      setName(item.name)
      setQuantity(item.quantity ?? '')
      setCategory(item.category ?? '')
      setCategoryLocked(!!item.category)
      setStore(item.store ?? '')
      setRecurring(item.recurring)
      setConfirmDelete(false)
    }
  }, [item])

  function handleNameChange(value: string) {
    setName(value)
    if (!categoryLocked) setCategory(guessCategory(value))
  }

  function handleCategoryChange(value: string) {
    setCategory(value)
    setCategoryLocked(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !item) return
    setSaving(true)
    try {
      await onSave(item.id, {
        name: name.trim(),
        quantity: quantity.trim() || undefined,
        category: category || undefined,
        store: store || undefined,
        recurring,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!item) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await onDelete(item.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal open={!!item} onClose={onClose} title="Edit item">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Item name</label>
          <input
            className="input"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="label">Store</label>
          <select className="input" value={store} onChange={e => setStore(e.target.value)}>
            <option value="">— any store —</option>
            {STORES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label">Quantity (optional)</label>
            <input
              className="input"
              placeholder="e.g. 1 gallon"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="label">Category</label>
            <select className="input" value={category} onChange={e => handleCategoryChange(e.target.value)}>
              <option value="">— none —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={recurring}
              onChange={e => setRecurring(e.target.checked)}
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${recurring ? 'bg-brand-600' : 'bg-gray-200'}`} />
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${recurring ? 'translate-x-4' : ''}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Recurring item</p>
            <p className="text-xs text-gray-400">Reappears automatically after being bought</p>
          </div>
        </label>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              confirmDelete
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-red-50 text-red-500 hover:bg-red-100'
            }`}
          >
            {deleting ? '…' : confirmDelete ? 'Confirm?' : 'Delete'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

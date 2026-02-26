'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { AppUser } from '@/lib/types'

interface AddGroceryModalProps {
  open: boolean
  onClose: () => void
  onAdd: (data: { name: string; quantity?: string; category?: string; recurring: boolean }, user: AppUser) => Promise<void>
  user: AppUser
}

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Household', 'Other']

export function AddGroceryModal({ open, onClose, onAdd, user }: AddGroceryModalProps) {
  const [name, setName]         = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [saving, setSaving]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onAdd(
        {
          name: name.trim(),
          quantity: quantity.trim() || undefined,
          category: category || undefined,
          recurring,
        },
        user
      )
      setName('')
      setQuantity('')
      setCategory('')
      setRecurring(false)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Grocery Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Item name</label>
          <input
            className="input"
            placeholder="e.g. Whole milk"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
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
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
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
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={saving || !name.trim()}>
            {saving ? 'Adding…' : 'Add item'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

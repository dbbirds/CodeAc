'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { AppUser } from '@/lib/types'

interface AddGroceryModalProps {
  open: boolean
  onClose: () => void
  onAdd: (data: { name: string; quantity?: string; category?: string; store?: string; recurring: boolean }, user: AppUser) => Promise<void>
  user: AppUser
  defaultStore?: string
}

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Household', 'Other']
const STORES = ['Hannaford', 'Healthy Living', 'Costco']

// Ordered list: more specific / multi-word entries first to win substring matching
const ITEM_CATEGORY_MAP: [string, string][] = [
  // Multi-word first
  ['sour cream', 'Dairy'], ['cream cheese', 'Dairy'], ['cottage cheese', 'Dairy'],
  ['half and half', 'Dairy'], ['heavy cream', 'Dairy'],
  ['ice cream', 'Frozen'], ['whipped cream', 'Frozen'], ['frozen', 'Frozen'],
  ['ground beef', 'Meat'], ['ground turkey', 'Meat'],
  ['paper towel', 'Household'], ['toilet paper', 'Household'], ['trash bag', 'Household'],
  ['peanut butter', 'Pantry'], ['almond butter', 'Pantry'],
  ['olive oil', 'Pantry'],
  // Beverages before produce (e.g. "orange juice" → Beverages, not Produce)
  ['lemonade', 'Beverages'], ['juice', 'Beverages'], ['coffee', 'Beverages'],
  ['tea', 'Beverages'], ['soda', 'Beverages'], ['kombucha', 'Beverages'],
  ['beer', 'Beverages'], ['wine', 'Beverages'], ['sparkling water', 'Beverages'],
  // Dairy
  ['milk', 'Dairy'], ['egg', 'Dairy'], ['cheese', 'Dairy'], ['butter', 'Dairy'],
  ['yogurt', 'Dairy'], ['cream', 'Dairy'],
  // Meat
  ['chicken', 'Meat'], ['beef', 'Meat'], ['pork', 'Meat'], ['salmon', 'Meat'],
  ['tuna', 'Meat'], ['turkey', 'Meat'], ['bacon', 'Meat'], ['sausage', 'Meat'],
  ['shrimp', 'Meat'], ['steak', 'Meat'], ['ham', 'Meat'], ['lamb', 'Meat'],
  ['fish', 'Meat'],
  // Produce
  ['apple', 'Produce'], ['banana', 'Produce'], ['orange', 'Produce'],
  ['lettuce', 'Produce'], ['spinach', 'Produce'], ['tomato', 'Produce'],
  ['onion', 'Produce'], ['garlic', 'Produce'], ['carrot', 'Produce'],
  ['broccoli', 'Produce'], ['celery', 'Produce'], ['cucumber', 'Produce'],
  ['pepper', 'Produce'], ['potato', 'Produce'], ['avocado', 'Produce'],
  ['lemon', 'Produce'], ['lime', 'Produce'], ['strawberr', 'Produce'],
  ['blueberr', 'Produce'], ['raspberry', 'Produce'], ['grape', 'Produce'],
  ['kale', 'Produce'], ['zucchini', 'Produce'], ['mushroom', 'Produce'],
  ['mango', 'Produce'], ['peach', 'Produce'], ['pear', 'Produce'],
  ['asparagus', 'Produce'], ['arugula', 'Produce'], ['cauliflower', 'Produce'],
  ['eggplant', 'Produce'], ['corn', 'Produce'],
  // Bakery
  ['bread', 'Bakery'], ['bagel', 'Bakery'], ['muffin', 'Bakery'],
  ['croissant', 'Bakery'], ['bun', 'Bakery'], ['roll', 'Bakery'],
  ['cookie', 'Bakery'], ['cake', 'Bakery'], ['pie', 'Bakery'],
  // Household
  ['soap', 'Household'], ['shampoo', 'Household'], ['conditioner', 'Household'],
  ['detergent', 'Household'], ['bleach', 'Household'], ['toothpaste', 'Household'],
  ['toothbrush', 'Household'], ['floss', 'Household'], ['sponge', 'Household'],
  ['tissue', 'Household'], ['dish soap', 'Household'],
  // Pantry
  ['rice', 'Pantry'], ['pasta', 'Pantry'], ['flour', 'Pantry'], ['sugar', 'Pantry'],
  ['salt', 'Pantry'], ['oil', 'Pantry'], ['vinegar', 'Pantry'], ['sauce', 'Pantry'],
  ['soup', 'Pantry'], ['bean', 'Pantry'], ['lentil', 'Pantry'], ['oat', 'Pantry'],
  ['cereal', 'Pantry'], ['cracker', 'Pantry'], ['chip', 'Pantry'], ['nut', 'Pantry'],
  ['honey', 'Pantry'], ['jam', 'Pantry'], ['jelly', 'Pantry'], ['syrup', 'Pantry'],
  ['broth', 'Pantry'], ['stock', 'Pantry'], ['canned', 'Pantry'],
  ['seasoning', 'Pantry'], ['spice', 'Pantry'],
]

function guessCategory(name: string): string {
  const lower = name.toLowerCase()
  for (const [keyword, cat] of ITEM_CATEGORY_MAP) {
    if (lower.includes(keyword)) return cat
  }
  return ''
}

export function AddGroceryModal({ open, onClose, onAdd, user, defaultStore }: AddGroceryModalProps) {
  const [name, setName]               = useState('')
  const [quantity, setQuantity]       = useState('')
  const [category, setCategory]       = useState('')
  const [categoryLocked, setCategoryLocked] = useState(false)
  const [store, setStore]             = useState(defaultStore ?? '')
  const [recurring, setRecurring]     = useState(false)
  const [saving, setSaving]           = useState(false)

  // Sync store when modal opens for a specific store
  useEffect(() => {
    if (open) setStore(defaultStore ?? '')
  }, [open, defaultStore])

  function handleNameChange(value: string) {
    setName(value)
    if (!categoryLocked) {
      setCategory(guessCategory(value))
    }
  }

  function handleCategoryChange(value: string) {
    setCategory(value)
    setCategoryLocked(true)
  }

  function reset() {
    setName(''); setQuantity(''); setCategory(''); setCategoryLocked(false)
    setStore(defaultStore ?? ''); setRecurring(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

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
          store: store || undefined,
          recurring,
        },
        user
      )
      reset()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add Grocery Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Item name</label>
          <input
            className="input"
            placeholder="e.g. Whole milk"
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
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={saving || !name.trim()}>
            {saving ? 'Adding…' : 'Add item'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

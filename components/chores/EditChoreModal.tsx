'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { calcNextDueDate } from '@/lib/dates'
import type { Chore, AppUser, ChoreFrequency } from '@/lib/types'

interface EditChoreModalProps {
  chore: Chore | null
  user: AppUser
  onClose: () => void
  onSave: (id: string, updates: Partial<Chore>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function EditChoreModal({ chore, user, onClose, onSave, onDelete }: EditChoreModalProps) {
  const [name, setName]                       = useState('')
  const [frequency, setFrequency]             = useState<ChoreFrequency>('weekly')
  const [dayOfWeek, setDayOfWeek]             = useState(1)
  const [dayOfMonth, setDayOfMonth]           = useState(1)
  const [intervalDays, setIntervalDays]       = useState(14)
  const [assignedTo, setAssignedTo]           = useState<string | null>(null)
  const [saving, setSaving]                   = useState(false)
  const [deleting, setDeleting]               = useState(false)
  const [confirmDelete, setConfirmDelete]     = useState(false)

  useEffect(() => {
    if (chore) {
      setName(chore.name)
      setFrequency(chore.frequency)
      setDayOfWeek(chore.dayOfWeek ?? 1)
      setDayOfMonth(chore.dayOfMonth ?? 1)
      setIntervalDays(chore.intervalDays ?? 14)
      setAssignedTo(chore.assignedTo ?? null)
      setConfirmDelete(false)
    }
  }, [chore])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !chore) return
    setSaving(true)
    try {
      const updatedData = {
        ...chore,
        name: name.trim(),
        frequency,
        dayOfWeek:    frequency === 'weekly'  ? dayOfWeek    : undefined,
        dayOfMonth:   frequency === 'monthly' ? dayOfMonth   : undefined,
        intervalDays: frequency === 'custom'  ? intervalDays : undefined,
      }
      const nextDueDate = calcNextDueDate(updatedData)
      await onSave(chore.id, {
        name: name.trim(),
        frequency,
        dayOfWeek:    frequency === 'weekly'  ? dayOfWeek    : undefined,
        dayOfMonth:   frequency === 'monthly' ? dayOfMonth   : undefined,
        intervalDays: frequency === 'custom'  ? intervalDays : undefined,
        assignedTo:     assignedTo,
        assignedToName: assignedTo === user.uid ? user.displayName : null,
        nextDueDate,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!chore) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await onDelete(chore.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal open={!!chore} onClose={onClose} title="Edit chore">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Chore name</label>
          <input
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="label">Frequency</label>
          <select
            className="input"
            value={frequency}
            onChange={e => setFrequency(e.target.value as ChoreFrequency)}
          >
            <option value="once">One-time</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom interval</option>
          </select>
        </div>

        {frequency === 'weekly' && (
          <div>
            <label className="label">Day of week</label>
            <select className="input" value={dayOfWeek} onChange={e => setDayOfWeek(Number(e.target.value))}>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
        )}

        {frequency === 'monthly' && (
          <div>
            <label className="label">Day of month</label>
            <input
              className="input"
              type="number"
              min={1}
              max={28}
              value={dayOfMonth}
              onChange={e => setDayOfMonth(Number(e.target.value))}
            />
          </div>
        )}

        {frequency === 'custom' && (
          <div>
            <label className="label">Repeat every (days)</label>
            <input
              className="input"
              type="number"
              min={1}
              max={365}
              value={intervalDays}
              onChange={e => setIntervalDays(Number(e.target.value))}
            />
          </div>
        )}

        <div>
          <label className="label">Assign to (optional)</label>
          <select
            className="input"
            value={assignedTo ?? ''}
            onChange={e => setAssignedTo(e.target.value || null)}
          >
            <option value="">Anyone</option>
            <option value={user.uid}>Me ({user.displayName})</option>
          </select>
        </div>

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

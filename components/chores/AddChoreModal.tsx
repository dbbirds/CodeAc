'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { Chore, AppUser, ChoreFrequency } from '@/lib/types'

interface AddChoreModalProps {
  open: boolean
  onClose: () => void
  onAdd: (
    data: Omit<Chore, 'id' | 'completedAt' | 'completedBy' | 'completedByName' | 'nextDueDate' | 'createdAt'>,
    user: AppUser
  ) => Promise<void>
  user: AppUser
  users: AppUser[]
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function AddChoreModal({ open, onClose, onAdd, user, users }: AddChoreModalProps) {
  const [name, setName]           = useState('')
  const [frequency, setFrequency] = useState<ChoreFrequency>('weekly')
  const [dayOfWeek, setDayOfWeek] = useState(1)        // Monday
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [intervalDays, setIntervalDays] = useState(14)
  const [assignedTo, setAssignedTo] = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const allUsers = [user, ...users.filter(u => u.uid !== user.uid)]
      const assignedUser = assignedTo ? allUsers.find(u => u.uid === assignedTo) : null
      await onAdd(
        {
          name: name.trim(),
          frequency,
          dayOfWeek:   frequency === 'weekly'  ? dayOfWeek   : undefined,
          dayOfMonth:  frequency === 'monthly' ? dayOfMonth  : undefined,
          intervalDays:frequency === 'custom'  ? intervalDays: undefined,
          assignedTo:      assignedTo ?? null,
          assignedToName:  assignedUser?.displayName ?? null,
          createdBy:       user.uid,
        },
        user
      )
      setName('')
      setFrequency('weekly')
      setAssignedTo(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add chore')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Chore">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Chore name</label>
          <input
            className="input"
            placeholder="e.g. Vacuum living room"
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
            {users.filter(u => u.uid !== user.uid).map(u => (
              <option key={u.uid} value={u.uid}>{u.displayName}</option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={saving || !name.trim()}>
            {saving ? 'Adding…' : 'Add chore'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

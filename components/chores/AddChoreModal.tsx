'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { requestNotificationPermission, saveChoreNotification } from '@/lib/notifications'
import type { Chore, AppUser, ChoreFrequency } from '@/lib/types'

interface AddChoreModalProps {
  open: boolean
  onClose: () => void
  onAdd: (
    data: Omit<Chore, 'id' | 'completedAt' | 'completedBy' | 'completedByName' | 'nextDueDate' | 'createdAt'>,
    user: AppUser
  ) => Promise<string>   // returns the new chore's Firestore ID
  user: AppUser
  users: AppUser[]
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function AddChoreModal({ open, onClose, onAdd, user, users }: AddChoreModalProps) {
  const [name, setName]               = useState('')
  const [frequency, setFrequency]     = useState<ChoreFrequency>('weekly')
  const [dayOfWeek, setDayOfWeek]     = useState(1)        // Monday
  const [dayOfMonth, setDayOfMonth]   = useState(1)
  const [intervalDays, setIntervalDays] = useState(14)
  const [assignedTo, setAssignedTo]   = useState<string | null>(null)
  const [dueTime, setDueTime]         = useState('')
  const [remindMe, setRemindMe]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const allUsers = [user, ...users.filter(u => u.uid !== user.uid)]
      const assignedUser = assignedTo ? allUsers.find(u => u.uid === assignedTo) : null
      const choreId = await onAdd(
        {
          name: name.trim(),
          frequency,
          dayOfWeek:    frequency === 'weekly'  ? dayOfWeek    : undefined,
          dayOfMonth:   frequency === 'monthly' ? dayOfMonth   : undefined,
          intervalDays: frequency === 'custom'  ? intervalDays : undefined,
          dueTime:      dueTime || undefined,
          assignedTo:      assignedTo ?? null,
          assignedToName:  assignedUser?.displayName ?? null,
          createdBy:       user.uid,
        },
        user
      )

      // Register push notification for the current user only
      if (remindMe && dueTime) {
        const token = await requestNotificationPermission()
        if (token) {
          await saveChoreNotification(user.uid, choreId, token)
        } else {
          // Permission denied — inform but don't block
          setError('Notification permission denied. Chore was saved without a reminder.')
          resetForm()
          return
        }
      }

      resetForm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add chore')
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setName('')
    setFrequency('weekly')
    setAssignedTo(null)
    setDueTime('')
    setRemindMe(false)
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

        {/* Optional reminder time */}
        <div>
          <label className="label">Reminder time (optional)</label>
          <input
            className="input"
            type="time"
            value={dueTime}
            onChange={e => {
              setDueTime(e.target.value)
              if (!e.target.value) setRemindMe(false)
            }}
          />
        </div>

        {/* Remind me toggle — only shown when a time is set */}
        {dueTime && (
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">Remind me</p>
              <p className="text-xs text-gray-500">Only you will receive this notification</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={remindMe}
              onClick={() => setRemindMe(v => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                remindMe ? 'bg-brand-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                  remindMe ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

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

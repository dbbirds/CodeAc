'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { AppUser, Project } from '@/lib/types'

interface AddProjectModalProps {
  open: boolean
  onClose: () => void
  onAdd: (
    data: Omit<Project, 'id' | 'photos' | 'createdBy' | 'createdByName' | 'createdAt' | 'updatedAt'>,
    user: AppUser
  ) => Promise<void>
  user: AppUser
}

export function AddProjectModal({ open, onClose, onAdd, user }: AddProjectModalProps) {
  const [name, setName]               = useState('')
  const [status, setStatus]           = useState<Project['status']>('not-started')
  const [priority, setPriority]       = useState<Project['priority']>('medium')
  const [estimatedCost, setEstimated] = useState('')
  const [actualCost, setActual]       = useState('')
  const [notes, setNotes]             = useState('')
  const [saving, setSaving]           = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onAdd(
        {
          name: name.trim(),
          status,
          priority,
          estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
          actualCost:    actualCost    ? Number(actualCost)    : undefined,
          notes:         notes.trim() || undefined,
        },
        user
      )
      setName(''); setStatus('not-started'); setPriority('medium')
      setEstimated(''); setActual(''); setNotes('')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Project name</label>
          <input
            className="input"
            placeholder="e.g. Repaint kitchen"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label">Status</label>
            <select className="input" value={status} onChange={e => setStatus(e.target.value as Project['status'])}>
              <option value="not-started">Not started</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="label">Priority</label>
            <select className="input" value={priority} onChange={e => setPriority(e.target.value as Project['priority'])}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label">Est. cost ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder="0"
              value={estimatedCost}
              onChange={e => setEstimated(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="label">Actual cost ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder="0"
              value={actualCost}
              onChange={e => setActual(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Any details, links, or references…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={saving || !name.trim()}>
            {saving ? 'Adding…' : 'Add project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

'use client'

import { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import type { Project, AppUser } from '@/lib/types'
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import clsx from 'clsx'

interface ProjectDetailModalProps {
  project: Project | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Project>) => Promise<void>
  onDelete: (project: Project) => Promise<void>
  onUploadPhoto: (projectId: string, file: File, currentPhotos: string[]) => Promise<void>
  user: AppUser
}

const STATUS_OPTS: { value: Project['status']; label: string }[] = [
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done',        label: 'Done' },
]

const PRIORITY_BADGE: Record<Project['priority'], 'red' | 'yellow' | 'gray'> = {
  high: 'red', medium: 'yellow', low: 'gray',
}

const STATUS_BADGE: Record<Project['status'], 'gray' | 'blue' | 'green'> = {
  'not-started': 'gray', 'in-progress': 'blue', done: 'green',
}

export function ProjectDetailModal({
  project, open, onClose, onUpdate, onDelete, onUploadPhoto, user,
}: ProjectDetailModalProps) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes]               = useState(project?.notes ?? '')
  const [uploading, setUploading]       = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!project) return null

  async function handleStatusChange(status: Project['status']) {
    await onUpdate(project!.id, { status })
  }

  async function handleNoteSave() {
    await onUpdate(project!.id, { notes })
    setEditingNotes(false)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUploadPhoto(project!.id, file, project!.photos)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${project!.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await onDelete(project!)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={project.name}>
      <div className="space-y-5">
        {/* Status + Priority */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge label={project.priority + ' priority'} variant={PRIORITY_BADGE[project.priority]} />
          <Badge
            label={STATUS_OPTS.find(s => s.value === project.status)?.label ?? project.status}
            variant={STATUS_BADGE[project.status]}
          />
        </div>

        {/* Status selector */}
        <div>
          <label className="label">Update status</label>
          <div className="flex gap-2">
            {STATUS_OPTS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={clsx(
                  'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                  project.status === opt.value
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cost */}
        {(project.estimatedCost !== undefined || project.actualCost !== undefined) && (
          <div className="flex gap-4">
            {project.estimatedCost !== undefined && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Estimated</p>
                <p className="text-sm font-semibold">${project.estimatedCost.toLocaleString()}</p>
              </div>
            )}
            {project.actualCost !== undefined && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Actual</p>
                <p className="text-sm font-semibold">${project.actualCost.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Notes</label>
            {!editingNotes && (
              <button
                onClick={() => { setNotes(project.notes ?? ''); setEditingNotes(true) }}
                className="text-xs text-brand-600 hover:text-brand-700"
              >
                Edit
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="space-y-2">
              <textarea
                className="input resize-none"
                rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => setEditingNotes(false)} className="btn-secondary flex-1 text-sm py-1.5">Cancel</button>
                <button onClick={handleNoteSave} className="btn-primary flex-1 text-sm py-1.5">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap min-h-[2rem]">
              {project.notes ?? <span className="text-gray-300 italic">No notes yet</span>}
            </p>
          )}
        </div>

        {/* Photos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Photos ({project.photos.length})</label>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
            >
              <PhotoIcon className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Add photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          {project.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {project.photos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Added by */}
        <p className="text-xs text-gray-400">Added by {project.createdByName}</p>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          {deleting ? 'Deleting…' : 'Delete project'}
        </button>
      </div>
    </Modal>
  )
}

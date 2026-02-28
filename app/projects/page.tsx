'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { AddProjectModal } from '@/components/projects/AddProjectModal'
import { ProjectDetailModal } from '@/components/projects/ProjectDetailModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { useProjects } from '@/lib/hooks/useProjects'
import { useAuth } from '@/lib/hooks/useAuth'
import { WrenchScrewdriverIcon, PlusIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import type { Project } from '@/lib/types'
import clsx from 'clsx'

const STATUS_LABEL: Record<Project['status'], string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  done: 'Done',
}

const STATUS_BADGE: Record<Project['status'], 'gray' | 'blue' | 'green'> = {
  'not-started': 'gray', 'in-progress': 'blue', done: 'green',
}

const PRIORITY_BADGE: Record<Project['priority'], 'red' | 'yellow' | 'gray'> = {
  high: 'red', medium: 'yellow', low: 'gray',
}

const PRIORITY_ORDER: Record<Project['priority'], number> = { high: 0, medium: 1, low: 2 }

export default function ProjectsPage() {
  const { user } = useAuth()
  const { projects, loading, addProject, updateProject, deleteProject, uploadPhoto } = useProjects()
  const [addOpen, setAddOpen]       = useState(false)
  const [selected, setSelected]     = useState<Project | null>(null)
  const [statusFilter, setFilter]   = useState<'all' | Project['status']>('all')

  const filtered = projects
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  const counts = {
    all:           projects.length,
    'not-started': projects.filter(p => p.status === 'not-started').length,
    'in-progress': projects.filter(p => p.status === 'in-progress').length,
    done:          projects.filter(p => p.status === 'done').length,
  }

  return (
    <AppShell title="Projects">
      <div className="px-4 py-4 space-y-4">
        {/* Status filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {(['all', 'not-started', 'in-progress', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                statusFilter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              )}
            >
              {f === 'all' ? `All (${counts.all})` : `${STATUS_LABEL[f]} (${counts[f]})`}
            </button>
          ))}
        </div>

        {/* Project list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="card h-20 animate-pulse bg-gray-50" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<WrenchScrewdriverIcon className="w-16 h-16" />}
            title="No projects"
            description="Track your home projects, budgets, and progress."
            action={<button onClick={() => setAddOpen(true)} className="btn-primary">Add project</button>}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(project => (
              <button
                key={project.id}
                onClick={() => setSelected(project)}
                className="card w-full text-left flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <Badge label={STATUS_LABEL[project.status]} variant={STATUS_BADGE[project.status]} />
                    <Badge label={project.priority} variant={PRIORITY_BADGE[project.priority]} />
                    {project.estimatedCost !== undefined && (
                      <Badge label={`Est. $${project.estimatedCost.toLocaleString()}`} variant="gray" />
                    )}
                    {project.photos.length > 0 && (
                      <Badge label={`${project.photos.length} photo${project.photos.length > 1 ? 's' : ''}`} variant="gray" />
                    )}
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed right-4 bottom-24 z-30 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg
                   flex items-center justify-center hover:bg-brand-700 active:bg-brand-800 transition-colors"
        aria-label="Add project"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

      <AddProjectModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addProject}
        user={user!}
      />

      <ProjectDetailModal
        project={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
        onUpdate={updateProject}
        onDelete={deleteProject}
        onUploadPhoto={uploadPhoto}
        user={user!}
      />
    </AppShell>
  )
}

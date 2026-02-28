export interface AppUser {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
}

// ─── Chores ──────────────────────────────────────────────────────────────────

export type ChoreFrequency = 'once' | 'weekly' | 'monthly' | 'custom'

export interface Chore {
  id: string
  name: string
  frequency: ChoreFrequency
  // weekly: 0 = Sun … 6 = Sat
  dayOfWeek?: number
  // monthly: 1–31
  dayOfMonth?: number
  // custom: every N days
  intervalDays?: number
  assignedTo?: string | null      // userId or null
  assignedToName?: string | null
  completedAt: Date | null
  completedBy: string | null      // userId
  completedByName: string | null
  nextDueDate: Date
  createdBy: string
  createdAt: Date
}

// ─── Groceries ───────────────────────────────────────────────────────────────

export interface GroceryItem {
  id: string
  name: string
  quantity?: string
  category?: string
  recurring: boolean
  boughtAt: Date | null
  boughtBy: string | null
  boughtByName: string | null
  addedBy: string
  addedByName: string
  createdAt: Date
}

// ─── Projects ────────────────────────────────────────────────────────────────

export type ProjectStatus = 'not-started' | 'in-progress' | 'done'
export type ProjectPriority = 'high' | 'medium' | 'low'

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  priority: ProjectPriority
  estimatedCost?: number
  actualCost?: number
  notes?: string
  photos: string[]              // Firebase Storage download URLs
  createdBy: string
  createdByName: string
  createdAt: Date
  updatedAt: Date
}

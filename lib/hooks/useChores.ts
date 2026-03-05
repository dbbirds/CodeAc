'use client'

import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp, deleteField,
} from 'firebase/firestore'
import { db } from '../firebase'
import { calcNextDueDate } from '../dates'
import type { Chore, AppUser } from '../types'

function fromFirestore(id: string, data: Record<string, unknown>): Chore {
  return {
    id,
    name:            data.name as string,
    frequency:       data.frequency as Chore['frequency'],
    dayOfWeek:       data.dayOfWeek as number | undefined,
    dayOfMonth:      data.dayOfMonth as number | undefined,
    intervalDays:    data.intervalDays as number | undefined,
    dueTime:         (data.dueTime as string | undefined) ?? undefined,
    assignedTo:      (data.assignedTo as string | null) ?? null,
    assignedToName:  (data.assignedToName as string | null) ?? null,
    completedAt:     data.completedAt ? (data.completedAt as Timestamp).toDate() : null,
    completedBy:     (data.completedBy as string | null) ?? null,
    completedByName: (data.completedByName as string | null) ?? null,
    nextDueDate:     (data.nextDueDate as Timestamp).toDate(),
    createdBy:       data.createdBy as string,
    createdAt:       (data.createdAt as Timestamp).toDate(),
  }
}

export function useChores() {
  const [chores, setChores]   = useState<Chore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'chores'), orderBy('nextDueDate', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setChores(snap.docs.map(d => fromFirestore(d.id, d.data())))
      setLoading(false)
    })
    return unsub
  }, [])

  async function addChore(
    data: Omit<Chore, 'id' | 'completedAt' | 'completedBy' | 'completedByName' | 'nextDueDate' | 'createdAt'>,
    user: AppUser
  ): Promise<string> {
    const nextDueDate = calcNextDueDate(data)
    const docData: Record<string, unknown> = {
      name:            data.name,
      frequency:       data.frequency,
      assignedTo:      data.assignedTo,
      assignedToName:  data.assignedToName,
      completedAt:     null,
      completedBy:     null,
      completedByName: null,
      nextDueDate:     Timestamp.fromDate(nextDueDate),
      createdBy:       user.uid,
      createdAt:       Timestamp.now(),
    }
    if (data.dayOfWeek !== undefined)    docData.dayOfWeek    = data.dayOfWeek
    if (data.dayOfMonth !== undefined)   docData.dayOfMonth   = data.dayOfMonth
    if (data.intervalDays !== undefined) docData.intervalDays = data.intervalDays
    if (data.dueTime !== undefined)      docData.dueTime      = data.dueTime
    const ref = await addDoc(collection(db, 'chores'), docData)
    return ref.id
  }

  async function completeChore(chore: Chore, user: AppUser) {
    const ref = doc(db, 'chores', chore.id)
    if (chore.frequency === 'once') {
      // One-off chore: just mark complete, leave it
      await updateDoc(ref, {
        completedAt:     Timestamp.now(),
        completedBy:     user.uid,
        completedByName: user.displayName,
      })
    } else {
      // Recurring: compute next due date, reset completed state
      const nextDueDate = calcNextDueDate(chore)
      await updateDoc(ref, {
        completedAt:     Timestamp.now(),
        completedBy:     user.uid,
        completedByName: user.displayName,
        nextDueDate:     Timestamp.fromDate(nextDueDate),
      })
    }
  }

  async function uncompleteChore(chore: Chore) {
    const ref = doc(db, 'chores', chore.id)
    await updateDoc(ref, {
      completedAt:     null,
      completedBy:     null,
      completedByName: null,
    })
  }

  async function updateChore(id: string, updates: Partial<Chore>) {
    const ref = doc(db, 'chores', id)
    const data: Record<string, unknown> = { ...updates }
    if (updates.nextDueDate) data.nextDueDate = Timestamp.fromDate(updates.nextDueDate)
    // Clear frequency-specific fields that no longer apply
    if (updates.frequency) {
      if (updates.frequency !== 'weekly')  data.dayOfWeek    = deleteField()
      if (updates.frequency !== 'monthly') data.dayOfMonth   = deleteField()
      if (updates.frequency !== 'custom')  data.intervalDays = deleteField()
    }
    // Strip undefined values — Firestore rejects them
    Object.keys(data).forEach(k => { if (data[k] === undefined) delete data[k] })
    await updateDoc(ref, data)
  }

  async function deleteChore(id: string) {
    await deleteDoc(doc(db, 'chores', id))
  }

  return { chores, loading, addChore, completeChore, uncompleteChore, updateChore, deleteChore }
}

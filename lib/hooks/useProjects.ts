'use client'

import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import type { Project, AppUser } from '../types'

function fromFirestore(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    name:          data.name as string,
    status:        data.status as Project['status'],
    priority:      data.priority as Project['priority'],
    estimatedCost: data.estimatedCost as number | undefined,
    actualCost:    data.actualCost as number | undefined,
    notes:         data.notes as string | undefined,
    photos:        (data.photos as string[]) ?? [],
    createdBy:     data.createdBy as string,
    createdByName: data.createdByName as string,
    createdAt:     (data.createdAt as { toDate(): Date }).toDate(),
    updatedAt:     (data.updatedAt as { toDate(): Date }).toDate(),
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setProjects(snap.docs.map(d => fromFirestore(d.id, d.data())))
      setLoading(false)
    })
    return unsub
  }, [])

  async function addProject(
    data: Omit<Project, 'id' | 'photos' | 'createdBy' | 'createdByName' | 'createdAt' | 'updatedAt'>,
    user: AppUser
  ) {
    const docData: Record<string, unknown> = {
      name:          data.name,
      status:        data.status,
      priority:      data.priority,
      photos:        [],
      createdBy:     user.uid,
      createdByName: user.displayName,
      createdAt:     Timestamp.now(),
      updatedAt:     Timestamp.now(),
    }
    if (data.estimatedCost !== undefined) docData.estimatedCost = data.estimatedCost
    if (data.actualCost    !== undefined) docData.actualCost    = data.actualCost
    if (data.notes         !== undefined) docData.notes         = data.notes
    await addDoc(collection(db, 'projects'), docData)
  }

  async function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdBy' | 'createdAt'>>) {
    const ref2 = doc(db, 'projects', id)
    await updateDoc(ref2, { ...updates, updatedAt: Timestamp.now() })
  }

  async function deleteProject(project: Project) {
    // Delete photos from storage first
    await Promise.all(
      project.photos.map(url => {
        const photoRef = ref(storage, url)
        return deleteObject(photoRef).catch(() => {})
      })
    )
    await deleteDoc(doc(db, 'projects', project.id))
  }

  async function uploadPhoto(projectId: string, file: File, currentPhotos: string[]): Promise<void> {
    const photoRef = ref(storage, `projects/${projectId}/${Date.now()}_${file.name}`)
    await uploadBytes(photoRef, file)
    const url = await getDownloadURL(photoRef)
    const docRef = doc(db, 'projects', projectId)
    await updateDoc(docRef, {
      photos:    [...currentPhotos, url],
      updatedAt: Timestamp.now(),
    })
  }

  return { projects, loading, addProject, updateProject, deleteProject, uploadPhoto }
}

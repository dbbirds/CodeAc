'use client'

import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp, deleteField,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { GroceryItem, AppUser } from '../types'

function fromFirestore(id: string, data: Record<string, unknown>): GroceryItem {
  return {
    id,
    name:        data.name as string,
    quantity:    data.quantity as string | undefined,
    category:    data.category as string | undefined,
    store:       data.store as string | undefined,
    recurring:   data.recurring as boolean,
    boughtAt:    data.boughtAt ? (data.boughtAt as { toDate(): Date }).toDate() : null,
    boughtBy:    (data.boughtBy as string | null) ?? null,
    boughtByName:(data.boughtByName as string | null) ?? null,
    addedBy:     data.addedBy as string,
    addedByName: data.addedByName as string,
    createdAt:   (data.createdAt as { toDate(): Date }).toDate(),
  }
}

export function useGroceries() {
  const [items, setItems]     = useState<GroceryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'groceries'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => fromFirestore(d.id, d.data())))
      setLoading(false)
    })
    return unsub
  }, [])

  async function addItem(
    data: { name: string; quantity?: string; category?: string; store?: string; recurring: boolean },
    user: AppUser
  ) {
    const docData: Record<string, unknown> = {
      name:         data.name,
      recurring:    data.recurring,
      boughtAt:     null,
      boughtBy:     null,
      boughtByName: null,
      addedBy:      user.uid,
      addedByName:  user.displayName,
      createdAt:    Timestamp.now(),
    }
    if (data.quantity) docData.quantity = data.quantity
    if (data.category) docData.category = data.category
    if (data.store)    docData.store    = data.store
    await addDoc(collection(db, 'groceries'), docData)
  }

  async function markBought(item: GroceryItem, user: AppUser) {
    const ref = doc(db, 'groceries', item.id)
    await updateDoc(ref, {
      boughtAt:     Timestamp.now(),
      boughtBy:     user.uid,
      boughtByName: user.displayName,
    })
  }

  async function markUnbought(item: GroceryItem) {
    const ref = doc(db, 'groceries', item.id)
    await updateDoc(ref, {
      boughtAt:     null,
      boughtBy:     null,
      boughtByName: null,
    })
  }

  async function updateItem(
    id: string,
    data: { name: string; quantity?: string; category?: string; store?: string; recurring: boolean }
  ) {
    const ref = doc(db, 'groceries', id)
    await updateDoc(ref, {
      name:      data.name,
      quantity:  data.quantity  ?? deleteField(),
      category:  data.category  ?? deleteField(),
      store:     data.store     ?? deleteField(),
      recurring: data.recurring,
    })
  }

  async function deleteItem(id: string) {
    await deleteDoc(doc(db, 'groceries', id))
  }

  /** Remove one-time bought items; reset recurring ones */
  async function clearBoughtItems(items: GroceryItem[]) {
    const bought = items.filter(i => i.boughtAt !== null)
    await Promise.all(
      bought.map(item => {
        const ref = doc(db, 'groceries', item.id)
        if (item.recurring) {
          return updateDoc(ref, { boughtAt: null, boughtBy: null, boughtByName: null })
        } else {
          return deleteDoc(ref)
        }
      })
    )
  }

  return { items, loading, addItem, updateItem, deleteItem, markBought, markUnbought, clearBoughtItems }
}

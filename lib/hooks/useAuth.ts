'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import type { AppUser } from '../types'

export function useAuth() {
  const [user, setUser]       = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid:         firebaseUser.uid,
          email:       firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? 'Unknown',
          photoURL:    firebaseUser.photoURL,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = () => signInWithPopup(auth, googleProvider)
  const logOut = () => signOut(auth)

  return { user, loading, signIn, logOut }
}

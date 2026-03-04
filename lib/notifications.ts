'use client'

import { getToken } from 'firebase/messaging'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db, getMessagingInstance } from './firebase'

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

/** Register the FCM service worker and pass it the Firebase config. */
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  // Pass config to the SW so it can initialise Firebase without hardcoded keys
  const config = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }
  const sw = reg.installing ?? reg.waiting ?? reg.active
  sw?.postMessage({ type: 'FIREBASE_CONFIG', config })
  return reg
}

/**
 * Request notification permission and return the FCM token.
 * Returns null if permission is denied or FCM isn't supported.
 */
export async function requestNotificationPermission(): Promise<string | null> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const messaging = await getMessagingInstance()
  if (!messaging) return null

  await registerServiceWorker()
  const token = await getToken(messaging, { vapidKey: VAPID_KEY })
  return token ?? null
}

/** Save a per-user notification subscription for a specific chore. */
export async function saveChoreNotification(
  userId: string,
  choreId: string,
  fcmToken: string,
) {
  const id = `${userId}_${choreId}`
  await setDoc(doc(db, 'choreNotifications', id), {
    userId,
    choreId,
    fcmToken,
    enabled: true,
  })
}

/** Remove a per-user notification subscription for a specific chore. */
export async function removeChoreNotification(userId: string, choreId: string) {
  const id = `${userId}_${choreId}`
  await deleteDoc(doc(db, 'choreNotifications', id))
}

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

function initAdmin() {
  if (getApps().length > 0) return

  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? '{}'
  )

  initializeApp({
    credential: cert(serviceAccount),
  })
}

initAdmin()

export const adminDb        = getFirestore()
export const adminMessaging = getMessaging()

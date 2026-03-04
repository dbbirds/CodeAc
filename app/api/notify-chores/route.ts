import { NextResponse } from 'next/server'
import { adminDb, adminMessaging } from '@/lib/firebaseAdmin'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * Called by Vercel Cron every hour.
 * Sends FCM push notifications to users who opted in for chores due this hour.
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (or an authorised caller)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now   = new Date()
  const hhmm  = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes() < 30 ? 0 : 30).padStart(2, '0')}`

  // Fetch chores whose nextDueDate is today and dueTime falls in the current hour window
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const endOfDay   = new Date(startOfDay.getTime() + 86400_000)

  const choresSnap = await adminDb
    .collection('chores')
    .where('nextDueDate', '>=', Timestamp.fromDate(startOfDay))
    .where('nextDueDate', '<',  Timestamp.fromDate(endOfDay))
    .where('completedAt', '==', null)
    .get()

  const currentHour = String(now.getUTCHours()).padStart(2, '0')
  const dueThisHour = choresSnap.docs.filter(d => {
    const dueTime: string | undefined = d.data().dueTime
    return dueTime?.startsWith(currentHour)
  })

  if (dueThisHour.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0

  await Promise.all(
    dueThisHour.map(async choreDoc => {
      const chore = choreDoc.data()

      // Find all users who opted in for this chore
      const notifSnap = await adminDb
        .collection('choreNotifications')
        .where('choreId', '==', choreDoc.id)
        .where('enabled', '==', true)
        .get()

      await Promise.all(
        notifSnap.docs.map(async notifDoc => {
          const { fcmToken } = notifDoc.data()
          try {
            await adminMessaging.send({
              token: fcmToken,
              notification: {
                title: '🏠 Home HQ Reminder',
                body:  `Time to: ${chore.name}`,
              },
              webpush: {
                notification: {
                  icon: '/icons/icon-192.png',
                },
              },
            })
            sent++
          } catch {
            // Token may be stale — remove it so we don't keep trying
            await notifDoc.ref.delete()
          }
        })
      )
    })
  )

  return NextResponse.json({ sent })
}

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Initialize Firebase Admin (server-side only)
function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:    process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail:  process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey:   process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

export async function GET(req: NextRequest) {
  // Simple secret check so only Vercel Cron can call this
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const db = getAdminDb()

  const now = Timestamp.now()
  const snap = await db.collection('chores')
    .where('completedAt', '==', null)
    .where('nextDueDate', '<=', now)
    .get()

  if (snap.empty) {
    return NextResponse.json({ sent: 0, message: 'No chores due' })
  }

  const dueChores = snap.docs.map(d => ({
    id:   d.id,
    name: d.data().name as string,
    assignedToName: d.data().assignedToName as string | null,
    frequency: d.data().frequency as string,
  }))

  const emailList = [
    process.env.REMINDER_EMAIL_1,
    process.env.REMINDER_EMAIL_2,
  ].filter(Boolean) as string[]

  const choreRows = dueChores.map(c => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${c.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;">${c.frequency}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;">${c.assignedToName ?? 'Anyone'}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111827;">
      <div style="margin-bottom:20px;">
        <span style="font-size:28px;">🏠</span>
        <h1 style="display:inline;margin-left:8px;font-size:20px;font-weight:700;">Home HQ Reminders</h1>
      </div>
      <p style="color:#4b5563;">You have <strong>${dueChores.length}</strong> chore${dueChores.length > 1 ? 's' : ''} due or overdue:</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Chore</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Freq</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Assigned</th>
          </tr>
        </thead>
        <tbody>${choreRows}</tbody>
      </table>
      <p style="margin-top:24px;font-size:13px;color:#9ca3af;">
        Sent daily by Home HQ &middot; Open the app to mark chores complete
      </p>
    </body>
    </html>
  `

  const results = await Promise.allSettled(
    emailList.map(to =>
      resend.emails.send({
        from:    process.env.RESEND_FROM_EMAIL ?? 'reminders@yourdomain.com',
        to,
        subject: `🏠 ${dueChores.length} chore${dueChores.length > 1 ? 's' : ''} due today`,
        html,
      })
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ sent, total: emailList.length, chores: dueChores.length })
}

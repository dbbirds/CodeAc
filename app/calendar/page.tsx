'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'

export default function CalendarPage() {
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL
  const [iframeError, setIframeError] = useState(false)

  const openUrl = embedUrl?.replace('/embed?', '/r?') ?? 'https://calendar.google.com'

  return (
    <AppShell title="Calendar">
      <div className="h-[calc(100vh-8rem)] px-0">
        {embedUrl ? (
          <div className="flex flex-col h-full">
            {iframeError ? (
              <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-4">
                <div className="text-4xl">📅</div>
                <p className="text-sm text-gray-500 max-w-xs">
                  The calendar couldn&apos;t load inline. Make sure it&apos;s set to{' '}
                  <strong>public</strong> in Google Calendar settings, then re-deploy.
                </p>
                <a
                  href={openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-5 py-2.5 text-sm rounded-xl"
                >
                  Open in Google Calendar
                </a>
              </div>
            ) : (
              <iframe
                src={embedUrl}
                className="w-full flex-1 border-0"
                title="Shared Google Calendar"
                onError={() => setIframeError(true)}
              />
            )}
            <div className="py-2 text-center border-t border-gray-100 flex-shrink-0">
              <a
                href={openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 underline"
              >
                Open in Google Calendar
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4">
            <div className="text-5xl">📅</div>
            <h2 className="text-lg font-semibold text-gray-700">Set up your shared calendar</h2>
            <div className="card text-left w-full max-w-sm text-sm text-gray-500 space-y-2">
              <p className="font-medium text-gray-700">How to set it up:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm">
                <li>Open Google Calendar on desktop</li>
                <li>Click the three dots next to your calendar → <strong>Settings and sharing</strong></li>
                <li>Under <strong>Access permissions</strong> → tick <strong>Make available to public</strong></li>
                <li>Scroll to <strong>Integrate calendar</strong> → copy the Embed code <code>src=</code> URL</li>
                <li>Add it as <code>NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL</code> in Vercel</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

'use client'

import { AppShell } from '@/components/AppShell'

export default function CalendarPage() {
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL

  return (
    <AppShell title="Calendar">
      <div className="h-[calc(100vh-8rem)] px-0">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            title="Shared Google Calendar"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4">
            <div className="text-5xl">📅</div>
            <h2 className="text-lg font-semibold text-gray-700">Set up your shared calendar</h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Add your Google Calendar embed URL to the{' '}
              <code className="bg-gray-100 px-1 rounded text-xs">NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL</code>{' '}
              environment variable to display your shared calendar here.
            </p>
            <div className="card text-left w-full max-w-sm text-sm text-gray-500 space-y-2">
              <p className="font-medium text-gray-700">How to get the embed URL:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm">
                <li>Open Google Calendar on desktop</li>
                <li>Create a new calendar called &ldquo;Home HQ&rdquo; and share it with Jenna</li>
                <li>Go to Settings → that calendar → Integrate calendar</li>
                <li>Copy the <strong>Embed code</strong> URL (the <code>src=</code> part)</li>
                <li>Add it to your <code>.env.local</code> file</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

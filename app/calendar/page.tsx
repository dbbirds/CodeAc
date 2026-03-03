'use client'

import { AppShell } from '@/components/AppShell'

export default function CalendarPage() {
  // Deep link opens the Google Calendar app on mobile, browser on desktop
  const calendarUrl = 'https://calendar.google.com'

  return (
    <AppShell title="Calendar">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] px-6 text-center gap-6">
        <div className="text-5xl">📅</div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">Google Calendar</h2>
          <p className="text-sm text-gray-400 max-w-xs">
            Opens in the Google Calendar app where you&apos;re already signed in.
          </p>
        </div>

        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm
                     rounded-xl px-6 py-3.5 text-gray-700 font-medium text-sm
                     hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="#4285F4" strokeWidth="1.5" />
            <path d="M3 9h18" stroke="#4285F4" strokeWidth="1.5" />
            <path d="M8 2v4M16 2v4" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Open Google Calendar
        </a>

        <p className="text-xs text-gray-300 max-w-xs">
          Tip: your &ldquo;This Week&rdquo; tab shows upcoming events from your calendars inline.
        </p>
      </div>
    </AppShell>
  )
}

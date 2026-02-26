'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { LoginPage } from './auth/LoginPage'
import { Nav } from './Nav'
import Image from 'next/image'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

interface AppShellProps {
  children: React.ReactNode
  title: string
}

export function AppShell({ children, title }: AppShellProps) {
  const { user, loading, signIn, logOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LoginPage onSignIn={signIn} />
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏠</span>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {user.photoURL && (
            <Image
              src={user.photoURL}
              alt={user.displayName}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <button
            onClick={logOut}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>

      <Nav />
    </div>
  )
}

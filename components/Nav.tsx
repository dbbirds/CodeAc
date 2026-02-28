'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  CheckCircleIcon,
  ShoppingCartIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
} from '@heroicons/react/24/solid'

const tabs = [
  { href: '/chores',    label: 'Chores',    Icon: CheckCircleIcon,       ActiveIcon: CheckCircleIconSolid },
  { href: '/groceries', label: 'Groceries', Icon: ShoppingCartIcon,      ActiveIcon: ShoppingCartIconSolid },
  { href: '/calendar',  label: 'Calendar',  Icon: CalendarDaysIcon,      ActiveIcon: CalendarDaysIconSolid },
  { href: '/projects',  label: 'Projects',  Icon: WrenchScrewdriverIcon, ActiveIcon: WrenchScrewdriverIconSolid },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex">
        {tabs.map(({ href, label, Icon, ActiveIcon }) => {
          const active = pathname.startsWith(href)
          const IconComp = active ? ActiveIcon : Icon
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors',
                active ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <IconComp className="w-6 h-6" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

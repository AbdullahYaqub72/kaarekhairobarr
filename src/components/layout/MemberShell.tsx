'use client'

import clsx from 'clsx'
import { Home, ShieldCheck, User, Users, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { Avatar } from '@/components/ui/Avatar'
import { BRAND_SHORT } from '@/config/brand'
import { useAuth } from '@/features/auth/AuthProvider'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const BASE_NAV: NavItem[] = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
]

const ADMIN_NAV: NavItem = { href: '/admin', label: 'Admin', icon: ShieldCheck }

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Members' app frame. Phones: slim navy top bar + bottom tab bar within thumb
 * reach. From `md:` up the tabs move into the top bar.
 */
export function MemberShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { me, isAdmin } = useAuth()
  const nav = isAdmin ? [...BASE_NAV, ADMIN_NAV] : BASE_NAV
  const name = me?.profile?.fullName ?? ''

  return (
    <div className="min-h-[100dvh]">
      <header className="pt-safe sticky top-0 z-30 bg-navy">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
          <Link href="/home" className="flex min-h-[44px] items-center gap-2.5" aria-label="KKB home">
            <BrandLogo width={44} />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{BRAND_SHORT} Members</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                className={clsx(
                  'inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 text-[15px] font-bold transition',
                  isActive(pathname, item.href) ? 'bg-white/10 text-white' : 'text-onnavy hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/profile" className="md:hidden" aria-label="Your profile">
            <Avatar name={name} size="sm" className="bg-navy-light" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl pb-28 md:pb-12">{children}</main>

      <nav
        aria-label="Main"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 shadow-bar backdrop-blur md:hidden"
      >
        <ul className="mx-auto flex max-w-md">
          {nav.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'flex min-h-[60px] flex-col items-center justify-center gap-1 text-xs font-bold transition',
                    active ? 'text-navy' : 'text-muted'
                  )}
                >
                  <span
                    className={clsx(
                      'inline-flex h-8 w-14 items-center justify-center rounded-full transition',
                      active && 'bg-navy-50'
                    )}
                  >
                    <item.icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

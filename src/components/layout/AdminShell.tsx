'use client'

import clsx from 'clsx'
import {
  ArrowLeft,
  DoorOpen,
  LayoutDashboard,
  Ticket,
  Users,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/shared/BrandLogo'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/members', label: 'Members', icon: UserCheck },
  { href: '/admin/invites', label: 'Invite codes', icon: Ticket },
  { href: '/admin/leave-requests', label: 'Leave requests', icon: DoorOpen },
  { href: '/admin/teams', label: 'Teams', icon: Users },
]

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
}

/** Admin frame: built for tablets/laptops, still usable on a phone. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-[100dvh] lg:flex">
      {/* Sidebar (laptop) */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy-deep lg:sticky lg:top-0 lg:flex lg:h-[100dvh]">
        <div className="flex items-center gap-3 px-6 py-6">
          <BrandLogo width={56} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">KKB</p>
            <p className="font-bold text-white">Admin</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Admin">
          {NAV.map((item) => {
            const active = isActive(pathname, item)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'flex min-h-[44px] items-center gap-3 rounded-control px-3 text-[15px] font-bold transition',
                  active ? 'bg-white/10 text-white' : 'text-onnavy hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className={clsx('h-5 w-5', active ? 'text-gold' : '')} aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <Link
          href="/home"
          className="m-3 flex min-h-[44px] items-center gap-2 rounded-control px-3 text-[15px] text-onnavy hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to members&apos; app
        </Link>
      </aside>

      {/* Top bar + tabs (phones & tablets) */}
      <div className="pt-safe sticky top-0 z-30 bg-navy-deep lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <BrandLogo width={44} />
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-navy-deep">
              Admin
            </span>
          </Link>
          <Link
            href="/home"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-onnavy hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> App
          </Link>
        </div>
        <nav className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-2" aria-label="Admin">
          {NAV.map((item) => {
            const active = isActive(pathname, item)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-bold',
                  active ? 'bg-white text-navy-deep' : 'text-onnavy'
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl text-navy">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[15px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'
import { unlockAdminAccess } from '@/lib/admin-auth'
import { BRAND_SHORT_CONTEXT } from '@/lib/brand'

const navigationItems = [
  { href: '/#campaigns', label: 'Campaigns' },
  { href: '/statistics', label: 'Statistics' },
  { href: '/#events', label: 'Events' },
  { href: '/#stories', label: 'Stories' },
  { href: '/#support', label: 'Support' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const clickTimestampsRef = React.useRef<number[]>([])
  const router = useRouter()

  const handleBrandClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      const now = Date.now()
      clickTimestampsRef.current = [
        ...clickTimestampsRef.current.filter((value) => now - value < 5000),
        now,
      ]

      if (clickTimestampsRef.current.length < 5) {
        return
      }

      event.preventDefault()
      clickTimestampsRef.current = []
      unlockAdminAccess()
      setIsMenuOpen(false)
      router.push('/goals')
    },
    [router]
  )

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-cream-50/80 backdrop-blur-xl">
      <div className="container-custom flex min-h-[4.5rem] items-center justify-between gap-3 py-3 sm:h-20 sm:py-0">
        <Link
          href="/#top"
          className="flex min-w-0 items-center gap-3"
          onClick={handleBrandClick}
        >
          <BrandLogo size="sm" className="shadow-soft" />
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold leading-none text-ink-900 sm:text-2xl">
              Kaare Khair o Barr
            </p>
            <p className="mt-1 hidden text-[0.68rem] uppercase tracking-[0.18em] text-ink-500 sm:block sm:text-xs sm:tracking-[0.22em]">
              {BRAND_SHORT_CONTEXT}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-600 hover:text-forest-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/statistics" className="btn-secondary">
            View Statistics
          </Link>
          <Link href="/#support" className="btn-primary">
            Support a Family
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-900/10 bg-white/80 text-ink-900 sm:h-11 sm:w-11 lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/60 bg-white/90 px-4 py-5 shadow-soft lg:hidden">
          <nav className="container-custom flex flex-col gap-3 px-0">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-transparent px-3 py-2 text-sm font-medium text-ink-700 hover:border-ink-900/10 hover:bg-cream-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Link
                href="/statistics"
                className="btn-secondary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                View Statistics
              </Link>
              <Link
                href="/#support"
                className="btn-primary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Support a Family
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

import clsx from 'clsx'
import { BRAND_SLOGAN } from '@/config/brand'
import { BrandLogo } from './BrandLogo'

export function GoldDivider({ className }: { className?: string }) {
  return <div className={clsx('h-[3px] w-[50px] rounded-sm bg-gold', className)} aria-hidden="true" />
}

/**
 * The navy header band from the KKB emails: gold logo, optional pill badge,
 * gold eyebrow, white title and the gold divider. Compact on phones.
 */
export function BrandHero({
  eyebrow,
  title,
  subtitle,
  badge,
  showLogo = true,
  showTagline = false,
  size = 'md',
  align = 'center',
  children,
}: {
  eyebrow?: string
  title: string
  subtitle?: React.ReactNode
  badge?: string
  showLogo?: boolean
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
  align?: 'center' | 'left'
  children?: React.ReactNode
}) {
  const centered = align === 'center'
  return (
    <header
      className={clsx(
        'pt-safe relative overflow-hidden bg-navy text-white',
        size === 'lg' ? 'pb-16' : size === 'md' ? 'pb-12' : 'pb-10'
      )}
    >
      {/* Soft gold glow, purely decorative */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className={clsx(
          'relative mx-auto max-w-xl px-5',
          size === 'lg' ? 'pt-12' : 'pt-7',
          centered ? 'flex flex-col items-center text-center' : ''
        )}
      >
        {showLogo && (
          <div className={size === 'lg' ? 'mb-5' : 'mb-3'}>
            <BrandLogo width={size === 'lg' ? 120 : size === 'md' ? 88 : 64} priority />
          </div>
        )}
        {badge && (
          <span className="mb-3 inline-block rounded-full bg-gold px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-navy-deep">
            {badge}
          </span>
        )}
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
        )}
        <h1 className={clsx('mt-2 text-white', size === 'lg' ? 'text-[28px]' : 'text-[22px]')}>{title}</h1>
        {showTagline && (
          <p lang="ur" dir="rtl" className="mt-2 font-urdu text-lg leading-loose text-gold">
            {BRAND_SLOGAN}
          </p>
        )}
        <GoldDivider className={clsx('mt-4', centered && 'mx-auto')} />
        {subtitle && <p className="mt-4 max-w-md text-[15px] leading-relaxed text-onnavy">{subtitle}</p>}
        {children}
      </div>
    </header>
  )
}

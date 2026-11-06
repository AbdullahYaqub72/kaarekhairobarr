import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

/** Title block at the top of member screens. */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
  backHref,
  backLabel = 'Back',
  action,
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  backHref?: string
  backLabel?: string
  action?: React.ReactNode
}) {
  return (
    <div className="px-4 pb-4 pt-5">
      {backHref && (
        <Link
          href={backHref}
          className="-ml-2 mb-1 inline-flex min-h-[44px] items-center gap-1.5 rounded-control px-2 text-[15px] font-bold text-navy-light"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-dark">{eyebrow}</p>
          )}
          <h1 className="text-[24px] text-navy">{title}</h1>
          {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  )
}

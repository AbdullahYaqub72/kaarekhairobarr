import clsx from 'clsx'
import { initials } from '@/lib/format'

const sizes = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-11 w-11 text-base',
  lg: 'h-16 w-16 text-xl',
}

export function Avatar({
  name,
  size = 'md',
  highlight = false,
  className,
}: {
  name: string
  size?: keyof typeof sizes
  /** Gold ring, used for team leads. */
  highlight?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-navy font-bold text-white',
        highlight && 'ring-2 ring-gold ring-offset-2 ring-offset-surface',
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </span>
  )
}

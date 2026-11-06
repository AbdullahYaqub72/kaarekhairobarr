import clsx from 'clsx'
import type { Tone } from '@/lib/format'

const tones: Record<Tone, string> = {
  neutral: 'bg-callout text-ink-soft',
  navy: 'bg-navy-50 text-navy',
  gold: 'bg-gold-soft text-gold-dark',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-bold',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

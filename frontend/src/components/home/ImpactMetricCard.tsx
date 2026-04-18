import clsx from 'clsx'
import type { StatCard } from '@/types/home'

interface ImpactMetricCardProps {
  stat: StatCard
  highlighted?: boolean
}

export default function ImpactMetricCard({
  stat,
  highlighted = false,
}: ImpactMetricCardProps) {
  return (
    <article
      className={clsx(
        'surface-panel h-full p-5 transition duration-300 hover:-translate-y-1',
        highlighted && 'bg-ink-900 text-cream-50'
      )}
    >
      <p
        className={clsx(
          'text-xs font-semibold uppercase tracking-[0.24em]',
          highlighted ? 'text-cream-100/65' : 'text-ink-500'
        )}
      >
        {stat.label}
      </p>
      <p
        className={clsx(
          'mt-4 font-display text-4xl font-semibold leading-none',
          highlighted ? 'text-cream-50' : 'text-ink-900'
        )}
      >
        {stat.value}
      </p>
      <p
        className={clsx(
          'mt-4 text-sm leading-7',
          highlighted ? 'text-cream-100/75' : 'text-ink-600'
        )}
      >
        {stat.detail}
      </p>
    </article>
  )
}

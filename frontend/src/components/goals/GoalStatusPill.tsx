import clsx from 'clsx'
import type { GoalStatus } from '@/types/goals'

interface GoalStatusPillProps {
  status: GoalStatus
}

const statusLabel: Record<GoalStatus, string> = {
  planned: 'Planned',
  active: 'Active',
  'at-risk': 'At Risk',
  completed: 'Completed',
}

const statusClassName: Record<GoalStatus, string> = {
  planned: 'bg-cream-100 text-clay-700',
  active: 'bg-forest-50 text-forest-700',
  'at-risk': 'bg-clay-100 text-clay-800',
  completed: 'bg-ink-900 text-cream-50',
}

export default function GoalStatusPill({ status }: GoalStatusPillProps) {
  return (
    <span
      className={clsx(
        'rounded-full px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em]',
        statusClassName[status]
      )}
    >
      {statusLabel[status]}
    </span>
  )
}

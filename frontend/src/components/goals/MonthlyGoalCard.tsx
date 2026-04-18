import clsx from 'clsx'
import { BadgeCheck, CircleDollarSign, Hourglass, Target } from 'lucide-react'
import GoalStatusPill from '@/components/goals/GoalStatusPill'
import { formatCurrency } from '@/lib/monthly-goals'
import type { MonthlyGoal } from '@/types/goals'

interface MonthlyGoalCardProps {
  goal: MonthlyGoal
  showMonthLabel?: boolean
}

const statusPanelClasses = {
  planned: 'from-cream-100/90 via-white to-cream-50/90',
  active: 'from-forest-100/80 via-white to-forest-50/80',
  'at-risk': 'from-clay-100/80 via-white to-clay-50/80',
  completed: 'from-ink-100/60 via-white to-cream-50/80',
} as const

export default function MonthlyGoalCard({
  goal,
  showMonthLabel = false,
}: MonthlyGoalCardProps) {
  const progress =
    goal.targetAmount > 0
      ? Math.min(100, Math.round((goal.raisedAmount / goal.targetAmount) * 100))
      : 0

  return (
    <article
      className={clsx(
        'surface-panel overflow-hidden bg-gradient-to-br p-6',
        statusPanelClasses[goal.status]
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/85 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-clay-700">
            {goal.category}
          </span>
          <GoalStatusPill status={goal.status} />
          {showMonthLabel ? (
            <span className="rounded-full bg-white/85 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-600">
              {goal.monthLabel}
            </span>
          ) : null}
        </div>
        <span
          className={clsx(
            'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
            goal.isTargetMet ? 'bg-forest-700 text-cream-50' : 'bg-white/85 text-ink-600'
          )}
        >
          {goal.isTargetMet ? 'Target met' : 'Still collecting'}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <h3 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink-900">
          {goal.title}
        </h3>
        <p className="text-sm leading-7 text-ink-600">{goal.purpose}</p>
      </div>

      <div className="mt-6 rounded-[24px] bg-white/80 p-4">
        <div className="mb-3 flex items-center justify-between text-sm text-ink-600">
          <span>Collection progress</span>
          <span className="font-semibold text-ink-900">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-ink-900/10">
          <div
            className="h-2 rounded-full bg-ink-900 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-cream-50 px-4 py-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-clay-700">
              <Target className="h-4 w-4" />
              Target
            </p>
            <p className="mt-2 text-sm font-semibold text-ink-900">
              {formatCurrency(goal.targetAmount)}
            </p>
          </div>
          <div className="rounded-2xl bg-forest-50 px-4 py-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-forest-700">
              <CircleDollarSign className="h-4 w-4" />
              Raised
            </p>
            <p className="mt-2 text-sm font-semibold text-ink-900">
              {formatCurrency(goal.raisedAmount)}
            </p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-500">
              {goal.isTargetMet ? (
                <BadgeCheck className="h-4 w-4 text-forest-700" />
              ) : (
                <Hourglass className="h-4 w-4 text-clay-700" />
              )}
              Left
            </p>
            <p className="mt-2 text-sm font-semibold text-ink-900">
              {formatCurrency(goal.remainingAmount)}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

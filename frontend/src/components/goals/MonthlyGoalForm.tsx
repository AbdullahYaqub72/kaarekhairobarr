'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { isFirebaseConfigured } from '@/lib/firebase'
import {
  GOAL_CATEGORY_OPTIONS,
  createMonthlyGoal,
  formatCompactCurrency,
  getCurrentMonthKey,
  updateMonthlyGoal,
} from '@/lib/monthly-goals'
import type { GoalStatus, MonthlyGoal, MonthlyGoalInput } from '@/types/goals'

interface MonthlyGoalFormProps {
  onGoalSaved: () => Promise<void> | void
  goalToEdit?: MonthlyGoal | null
  onCancelEdit?: () => void
}

const statusOptions: Array<{ value: GoalStatus; label: string }> = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'at-risk', label: 'At risk' },
  { value: 'completed', label: 'Completed' },
]

export default function MonthlyGoalForm({
  onGoalSaved,
  goalToEdit = null,
  onCancelEdit,
}: MonthlyGoalFormProps) {
  const defaultReportingMonth = getCurrentMonthKey()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MonthlyGoalInput>({
    defaultValues: {
      title: '',
      category: GOAL_CATEGORY_OPTIONS[0],
      purpose: '',
      targetAmount: 0,
      raisedAmount: 0,
      status: 'active',
      reportingMonth: defaultReportingMonth,
    },
  })

  useEffect(() => {
    if (goalToEdit) {
      reset({
        title: goalToEdit.title,
        category: goalToEdit.category,
        purpose: goalToEdit.purpose,
        targetAmount: goalToEdit.targetAmount,
        raisedAmount: goalToEdit.raisedAmount,
        status: goalToEdit.status,
        reportingMonth: goalToEdit.monthKey,
      })
      return
    }

    reset({
      title: '',
      category: GOAL_CATEGORY_OPTIONS[0],
      purpose: '',
      targetAmount: 0,
      raisedAmount: 0,
      status: 'active',
      reportingMonth: defaultReportingMonth,
    })
  }, [defaultReportingMonth, goalToEdit, reset])

  const watchedTarget = Number(watch('targetAmount') ?? 0)
  const watchedRaised = Number(watch('raisedAmount') ?? 0)
  const remainingAmount = Math.max(0, watchedTarget - watchedRaised)

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (goalToEdit) {
        await updateMonthlyGoal(goalToEdit.id, values)
        toast.success('Monthly goal updated.')
      } else {
        await createMonthlyGoal(values)
        toast.success('Monthly goal saved.')
      }

      reset({
        title: '',
        category: values.category || GOAL_CATEGORY_OPTIONS[0],
        purpose: '',
        targetAmount: 0,
        raisedAmount: 0,
        status: 'active',
        reportingMonth: values.reportingMonth || defaultReportingMonth,
      })
      onCancelEdit?.()
      await onGoalSaved()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to save the monthly goal right now.'
      )
    }
  })

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="label" htmlFor="title">
          Campaign title
        </label>
        <input
          id="title"
          className="field"
          placeholder="Family ration drive"
          {...register('title', { required: 'Please add a campaign title.' })}
        />
        {errors.title ? <p className="mt-2 text-sm text-clay-700">{errors.title.message}</p> : null}
      </div>

      <div>
        <label className="label" htmlFor="category">
          Category
        </label>
        <select id="category" className="field" {...register('category', { required: true })}>
          {GOAL_CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="purpose">
          Purpose
        </label>
        <textarea
          id="purpose"
          rows={4}
          className="field resize-none"
          placeholder="What this month’s goal will support and why it matters."
          {...register('purpose', { required: 'Please describe the purpose of this goal.' })}
        />
        {errors.purpose ? (
          <p className="mt-2 text-sm text-clay-700">{errors.purpose.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="targetAmount">
            Target amount
          </label>
          <input
            id="targetAmount"
            type="number"
            min="0"
            className="field"
            placeholder="450000"
            {...register('targetAmount', {
              required: 'Please add the target amount.',
              valueAsNumber: true,
              min: {
                value: 1,
                message: 'Target amount should be greater than zero.',
              },
            })}
          />
          {errors.targetAmount ? (
            <p className="mt-2 text-sm text-clay-700">{errors.targetAmount.message}</p>
          ) : null}
        </div>

        <div>
          <label className="label" htmlFor="raisedAmount">
            Collected so far
          </label>
          <input
            id="raisedAmount"
            type="number"
            min="0"
            className="field"
            placeholder="120000"
            {...register('raisedAmount', {
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Collected amount cannot be negative.',
              },
              validate: (value) =>
                Number(value) <= Number(watch('targetAmount') ?? 0) ||
                'Collected amount cannot be greater than the target.',
            })}
          />
          {errors.raisedAmount ? (
            <p className="mt-2 text-sm text-clay-700">{errors.raisedAmount.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select id="status" className="field" {...register('status')}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="reportingMonth">
            Reporting month
          </label>
          <input
            id="reportingMonth"
            type="month"
            className="field"
            {...register('reportingMonth', {
              required: 'Please choose a month.',
            })}
          />
          {errors.reportingMonth ? (
            <p className="mt-2 text-sm text-clay-700">{errors.reportingMonth.message}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-[24px] bg-ink-900 px-5 py-4 text-cream-50">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-100/65">
          Live preview
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">Target</p>
            <p className="mt-2 text-lg font-semibold">{formatCompactCurrency(watchedTarget)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">Collected</p>
            <p className="mt-2 text-lg font-semibold">{formatCompactCurrency(watchedRaised)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">Still left</p>
            <p className="mt-2 text-lg font-semibold">{formatCompactCurrency(remainingAmount)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-ink-600">
          {isFirebaseConfigured
            ? goalToEdit
              ? 'You are editing an existing goal record.'
              : 'Changes here update the monthly goal records used across the site.'
            : 'Saving is temporarily unavailable right now.'}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {goalToEdit ? (
            <button className="btn-secondary" type="button" onClick={() => onCancelEdit?.()}>
              Cancel Edit
            </button>
          ) : null}
          <button
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting || !isFirebaseConfigured}
          >
            {isSubmitting
              ? goalToEdit
                ? 'Updating Goal...'
                : 'Saving Goal...'
              : isFirebaseConfigured
                ? goalToEdit
                  ? 'Update Goal'
                  : 'Save Monthly Goal'
                : 'Saving Unavailable'}
          </button>
        </div>
      </div>
    </form>
  )
}

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { isFirebaseConfigured } from '@/lib/firebase'
import {
  createCampaignItem,
  updateCampaignItem,
} from '@/lib/home-content'
import { formatCompactCurrency } from '@/lib/monthly-goals'
import type { Campaign, CampaignInput } from '@/types/home'

interface CampaignFormProps {
  onCampaignSaved: () => Promise<void> | void
  campaignToEdit?: Campaign | null
  onCancelEdit?: () => void
}

const accentOptions: Array<{ value: Campaign['accent']; label: string }> = [
  { value: 'forest', label: 'Forest' },
  { value: 'cream', label: 'Cream' },
  { value: 'clay', label: 'Clay' },
]

export default function CampaignForm({
  onCampaignSaved,
  campaignToEdit = null,
  onCancelEdit,
}: CampaignFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CampaignInput>({
    defaultValues: {
      title: '',
      shortDescription: '',
      category: 'Relief',
      targetAmount: 0,
      raisedAmount: 0,
      beneficiariesLabel: '',
      featured: true,
      accent: 'forest',
    },
  })

  useEffect(() => {
    if (campaignToEdit) {
      reset({
        title: campaignToEdit.title,
        shortDescription: campaignToEdit.shortDescription,
        category: campaignToEdit.category,
        targetAmount: campaignToEdit.targetAmount,
        raisedAmount: campaignToEdit.raisedAmount,
        beneficiariesLabel: campaignToEdit.beneficiariesLabel,
        featured: campaignToEdit.featured,
        accent: campaignToEdit.accent,
      })
      return
    }

    reset({
      title: '',
      shortDescription: '',
      category: 'Relief',
      targetAmount: 0,
      raisedAmount: 0,
      beneficiariesLabel: '',
      featured: true,
      accent: 'forest',
    })
  }, [campaignToEdit, reset])

  const watchedTarget = Number(watch('targetAmount') ?? 0)
  const watchedRaised = Number(watch('raisedAmount') ?? 0)
  const watchedFeatured = watch('featured')
  const watchedAccent = watch('accent')
  const remainingAmount = Math.max(0, watchedTarget - watchedRaised)

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (campaignToEdit) {
        await updateCampaignItem(campaignToEdit.id, values)
        toast.success('Campaign updated.')
      } else {
        await createCampaignItem(values)
        toast.success('Campaign saved.')
      }

      reset({
        title: '',
        shortDescription: '',
        category: 'Relief',
        targetAmount: 0,
        raisedAmount: 0,
        beneficiariesLabel: '',
        featured: true,
        accent: 'forest',
      })
      onCancelEdit?.()
      await onCampaignSaved()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to save the campaign right now.'
      )
    }
  })

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="label" htmlFor="campaignTitle">
          Campaign title
        </label>
        <input
          id="campaignTitle"
          className="field"
          placeholder="Dialysis Access Fund"
          {...register('title', { required: 'Please add a campaign title.' })}
        />
        {errors.title ? <p className="mt-2 text-sm text-clay-700">{errors.title.message}</p> : null}
      </div>

      <div>
        <label className="label" htmlFor="campaignDescription">
          Short description
        </label>
        <textarea
          id="campaignDescription"
          rows={4}
          className="field resize-none"
          placeholder="Describe the campaign clearly so it works on the landing page too."
          {...register('shortDescription', {
            required: 'Please add a short description.',
          })}
        />
        {errors.shortDescription ? (
          <p className="mt-2 text-sm text-clay-700">{errors.shortDescription.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="campaignCategory">
            Category
          </label>
          <input
            id="campaignCategory"
            className="field"
            placeholder="Medical Support"
            {...register('category', { required: 'Please add a campaign category.' })}
          />
          {errors.category ? (
            <p className="mt-2 text-sm text-clay-700">{errors.category.message}</p>
          ) : null}
        </div>

        <div>
          <label className="label" htmlFor="campaignAccent">
            Accent style
          </label>
          <select id="campaignAccent" className="field" {...register('accent')}>
            {accentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="campaignImpact">
          Impact label
        </label>
        <input
          id="campaignImpact"
          className="field"
          placeholder="38 patients in active follow-up"
          {...register('beneficiariesLabel', {
            required: 'Please add the impact label.',
          })}
        />
        {errors.beneficiariesLabel ? (
          <p className="mt-2 text-sm text-clay-700">{errors.beneficiariesLabel.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="campaignTargetAmount">
            Target amount
          </label>
          <input
            id="campaignTargetAmount"
            type="number"
            min="0"
            className="field"
            placeholder="600000"
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
          <label className="label" htmlFor="campaignRaisedAmount">
            Raised amount
          </label>
          <input
            id="campaignRaisedAmount"
            type="number"
            min="0"
            className="field"
            placeholder="274000"
            {...register('raisedAmount', {
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Raised amount cannot be negative.',
              },
              validate: (value) =>
                Number(value) <= Number(watch('targetAmount') ?? 0) ||
                'Raised amount cannot be greater than the target.',
            })}
          />
          {errors.raisedAmount ? (
            <p className="mt-2 text-sm text-clay-700">{errors.raisedAmount.message}</p>
          ) : null}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-[24px] bg-cream-50 px-5 py-4 text-sm text-ink-700">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-ink-300 text-forest-700 focus:ring-forest-200"
          {...register('featured')}
        />
        <span>
          <span className="block font-semibold text-ink-900">Show as featured campaign</span>
          Featured campaigns are eligible to appear on the public landing page.
        </span>
      </label>

      <div className="rounded-[24px] bg-ink-900 px-5 py-4 text-cream-50">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-100/65">
          Campaign preview
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">Target</p>
            <p className="mt-2 text-sm font-semibold">{formatCompactCurrency(watchedTarget)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">Raised</p>
            <p className="mt-2 text-sm font-semibold">{formatCompactCurrency(watchedRaised)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">Still left</p>
            <p className="mt-2 text-sm font-semibold">{formatCompactCurrency(remainingAmount)}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-cream-100/75">
          {watchedFeatured ? 'Featured' : 'Not featured'} with the {watchedAccent} accent.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-ink-600">
          {isFirebaseConfigured
            ? campaignToEdit
              ? 'You are editing an existing campaign record.'
              : 'Add or refine featured campaigns here for the public landing page.'
            : 'Saving is temporarily unavailable right now.'}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {campaignToEdit ? (
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
              ? campaignToEdit
                ? 'Updating Campaign...'
                : 'Saving Campaign...'
              : isFirebaseConfigured
                ? campaignToEdit
                  ? 'Update Campaign'
                  : 'Save Campaign'
                : 'Saving Unavailable'}
          </button>
        </div>
      </div>
    </form>
  )
}

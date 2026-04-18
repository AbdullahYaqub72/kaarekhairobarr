'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { isFirebaseConfigured } from '@/lib/firebase'
import {
  createTestimonialItem,
  updateTestimonialItem,
} from '@/lib/home-content'
import type { Testimonial, TestimonialInput } from '@/types/home'

interface TestimonialFormProps {
  onTestimonialSaved: () => Promise<void> | void
  testimonialToEdit?: Testimonial | null
  onCancelEdit?: () => void
}

export default function TestimonialForm({
  onTestimonialSaved,
  testimonialToEdit = null,
  onCancelEdit,
}: TestimonialFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialInput>({
    defaultValues: {
      name: '',
      role: '',
      content: '',
      highlight: '',
      featured: true,
    },
  })

  useEffect(() => {
    if (testimonialToEdit) {
      reset({
        name: testimonialToEdit.name,
        role: testimonialToEdit.role,
        content: testimonialToEdit.content,
        highlight: testimonialToEdit.highlight,
        featured: testimonialToEdit.featured,
      })
      return
    }

    reset({
      name: '',
      role: '',
      content: '',
      highlight: '',
      featured: true,
    })
  }, [reset, testimonialToEdit])

  const watchedFeatured = watch('featured')

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (testimonialToEdit) {
        await updateTestimonialItem(testimonialToEdit.id, values)
        toast.success('Testimonial updated.')
      } else {
        await createTestimonialItem(values)
        toast.success('Testimonial saved.')
      }

      reset({
        name: '',
        role: '',
        content: '',
        highlight: '',
        featured: true,
      })
      onCancelEdit?.()
      await onTestimonialSaved()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to save the testimonial right now.'
      )
    }
  })

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="testimonialName">
            Name
          </label>
          <input
            id="testimonialName"
            className="field"
            placeholder="Ayesha Khan"
            {...register('name', { required: 'Please add a name.' })}
          />
          {errors.name ? <p className="mt-2 text-sm text-clay-700">{errors.name.message}</p> : null}
        </div>

        <div>
          <label className="label" htmlFor="testimonialRole">
            Role
          </label>
          <input
            id="testimonialRole"
            className="field"
            placeholder="Volunteer Coordinator"
            {...register('role', { required: 'Please add a role.' })}
          />
          {errors.role ? <p className="mt-2 text-sm text-clay-700">{errors.role.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="testimonialHighlight">
          Highlight
        </label>
        <input
          id="testimonialHighlight"
          className="field"
          placeholder="Clear goals made it easy to keep giving."
          {...register('highlight', { required: 'Please add the highlight line.' })}
        />
        {errors.highlight ? (
          <p className="mt-2 text-sm text-clay-700">{errors.highlight.message}</p>
        ) : null}
      </div>

      <div>
        <label className="label" htmlFor="testimonialContent">
          Testimonial content
        </label>
        <textarea
          id="testimonialContent"
          rows={5}
          className="field resize-none"
          placeholder="Write the full testimonial body here."
          {...register('content', { required: 'Please add the testimonial content.' })}
        />
        {errors.content ? (
          <p className="mt-2 text-sm text-clay-700">{errors.content.message}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 rounded-[24px] bg-cream-50 px-5 py-4 text-sm text-ink-700">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-ink-300 text-forest-700 focus:ring-forest-200"
          {...register('featured')}
        />
        <span>
          <span className="block font-semibold text-ink-900">Show as featured testimonial</span>
          Featured testimonials are eligible to appear on the public stories section.
        </span>
      </label>

      <div className="rounded-[24px] bg-ink-900 px-5 py-4 text-cream-50">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-100/65">
          Visibility
        </p>
        <p className="mt-3 text-sm font-semibold">
          {watchedFeatured ? 'Featured on the public site' : 'Saved but not featured publicly'}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-ink-600">
          {isFirebaseConfigured
            ? testimonialToEdit
              ? 'You are editing an existing testimonial record.'
              : 'Manage public testimonials and stories from here.'
            : 'Saving is temporarily unavailable right now.'}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {testimonialToEdit ? (
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
              ? testimonialToEdit
                ? 'Updating Testimonial...'
                : 'Saving Testimonial...'
              : isFirebaseConfigured
                ? testimonialToEdit
                  ? 'Update Testimonial'
                  : 'Save Testimonial'
                : 'Saving Unavailable'}
          </button>
        </div>
      </div>
    </form>
  )
}

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { isFirebaseConfigured } from '@/lib/firebase'
import { createEventItem, updateEventItem } from '@/lib/home-content'
import type { EventItem, EventItemInput } from '@/types/home'

interface EventFormProps {
  onEventSaved: () => Promise<void> | void
  eventToEdit?: EventItem | null
  onCancelEdit?: () => void
}

const eventStatusOptions = ['upcoming', 'ongoing', 'completed', 'archived'] as const

function getDefaultEventDateInput() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

function toDateTimeLocalValue(value: string) {
  const nextDate = new Date(value)

  if (Number.isNaN(nextDate.getTime())) {
    return getDefaultEventDateInput()
  }

  const localDate = new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

export default function EventForm({
  onEventSaved,
  eventToEdit = null,
  onCancelEdit,
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventItemInput>({
    defaultValues: {
      title: '',
      description: '',
      eventDate: getDefaultEventDateInput(),
      location: 'UET Lahore',
      category: 'Campus Outreach',
      status: 'upcoming',
      featured: false,
    },
  })

  useEffect(() => {
    if (eventToEdit) {
      reset({
        title: eventToEdit.title,
        description: eventToEdit.description,
        eventDate: toDateTimeLocalValue(eventToEdit.eventDate),
        location: eventToEdit.location,
        category: eventToEdit.category,
        status: eventToEdit.status,
        featured: eventToEdit.featured,
      })
      return
    }

    reset({
      title: '',
      description: '',
      eventDate: getDefaultEventDateInput(),
      location: 'UET Lahore',
      category: 'Campus Outreach',
      status: 'upcoming',
      featured: false,
    })
  }, [eventToEdit, reset])

  const watchedDate = watch('eventDate')
  const watchedFeatured = watch('featured')

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (eventToEdit) {
        await updateEventItem(eventToEdit.id, values)
        toast.success('Event updated.')
      } else {
        await createEventItem(values)
        toast.success('Event saved.')
      }
      reset({
        title: '',
        description: '',
        eventDate: getDefaultEventDateInput(),
        location: values.location || 'UET Lahore',
        category: values.category || 'Campus Outreach',
        status: 'upcoming',
        featured: false,
      })
      onCancelEdit?.()
      await onEventSaved()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save the event right now.')
    }
  })

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="label" htmlFor="eventTitle">
          Event title
        </label>
        <input
          id="eventTitle"
          className="field"
          placeholder="Dialysis support camp"
          {...register('title', { required: 'Please add an event title.' })}
        />
        {errors.title ? <p className="mt-2 text-sm text-clay-700">{errors.title.message}</p> : null}
      </div>

      <div>
        <label className="label" htmlFor="eventDescription">
          Description
        </label>
        <textarea
          id="eventDescription"
          rows={4}
          className="field resize-none"
          placeholder="Describe what will happen, who it helps, and why it matters."
          {...register('description', { required: 'Please add a short event description.' })}
        />
        {errors.description ? (
          <p className="mt-2 text-sm text-clay-700">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="eventCategory">
            Category
          </label>
          <input
            id="eventCategory"
            className="field"
            placeholder="Campus Outreach"
            {...register('category', { required: 'Please add an event category.' })}
          />
          {errors.category ? (
            <p className="mt-2 text-sm text-clay-700">{errors.category.message}</p>
          ) : null}
        </div>

        <div>
          <label className="label" htmlFor="eventLocation">
            Location
          </label>
          <input
            id="eventLocation"
            className="field"
            placeholder="UET Lahore"
            {...register('location', { required: 'Please add the event location.' })}
          />
          {errors.location ? (
            <p className="mt-2 text-sm text-clay-700">{errors.location.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="eventDate">
            Event date and time
          </label>
          <input
            id="eventDate"
            type="datetime-local"
            className="field"
            {...register('eventDate', { required: 'Please choose the event date and time.' })}
          />
          {errors.eventDate ? (
            <p className="mt-2 text-sm text-clay-700">{errors.eventDate.message}</p>
          ) : null}
        </div>

        <div>
          <label className="label" htmlFor="eventStatus">
            Status
          </label>
          <select id="eventStatus" className="field" {...register('status')}>
            {eventStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-[24px] bg-cream-50 px-5 py-4 text-sm text-ink-700">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-ink-300 text-forest-700 focus:ring-forest-200"
          {...register('featured')}
        />
        <span>
          <span className="block font-semibold text-ink-900">Feature this event</span>
          Featured events are prioritized in the public events section.
        </span>
      </label>

      <div className="rounded-[24px] bg-ink-900 px-5 py-4 text-cream-50">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-100/65">
          Event preview
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">Scheduled</p>
            <p className="mt-2 text-sm font-semibold">
              {watchedDate ? new Date(watchedDate).toLocaleString('en-PK') : 'Choose a date'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">Visibility</p>
            <p className="mt-2 text-sm font-semibold">
              {watchedFeatured ? 'Featured on public events' : 'Standard event'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-ink-600">
          {isFirebaseConfigured
            ? eventToEdit
              ? 'You are editing an existing event record.'
              : 'Add new events here and keep the public timeline current.'
            : 'Saving is temporarily unavailable right now.'}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {eventToEdit ? (
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
              ? eventToEdit
                ? 'Updating Event...'
                : 'Saving Event...'
              : isFirebaseConfigured
                ? eventToEdit
                  ? 'Update Event'
                  : 'Save Event'
                : 'Saving Unavailable'}
          </button>
        </div>
      </div>
    </form>
  )
}

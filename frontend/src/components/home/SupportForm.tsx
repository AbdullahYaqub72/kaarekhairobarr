'use client'

import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { isFirebaseConfigured } from '@/lib/firebase'
import { submitSupportRequest } from '@/lib/home-content'
import type { SupportFormInput } from '@/types/home'

const supportOptions = [
  { value: 'donation', label: 'Fund a campaign' },
  { value: 'volunteer', label: 'Join as a volunteer' },
  { value: 'partnership', label: 'Explore a partnership' },
]

export default function SupportForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormInput>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      interest: supportOptions[0].value,
      message: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitSupportRequest(values)
      toast.success('Your request was received. The team can follow up from there.')
      reset()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to save your request right now.'
      )
    }
  })

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            className="field"
            placeholder="Your name"
            {...register('fullName', { required: 'Please share your name.' })}
          />
          {errors.fullName ? (
            <p className="mt-2 text-sm text-clay-700">{errors.fullName.message}</p>
          ) : null}
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="field"
            placeholder="you@example.com"
            {...register('email', {
              required: 'Please share an email.',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Enter a valid email address.',
              },
            })}
          />
          {errors.email ? (
            <p className="mt-2 text-sm text-clay-700">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            className="field"
            placeholder="+92 300 000 0000"
            {...register('phone')}
          />
        </div>

        <div>
          <label className="label" htmlFor="interest">
            I want to
          </label>
          <select id="interest" className="field" {...register('interest')}>
            {supportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          className="field resize-none"
          placeholder="Tell the team what kind of support or collaboration you have in mind."
          {...register('message', { required: 'Please add a short message.' })}
        />
        {errors.message ? (
          <p className="mt-2 text-sm text-clay-700">{errors.message.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-ink-600">
          {isFirebaseConfigured
            ? 'Submissions are saved so the team can follow up quickly.'
            : 'Saving is temporarily unavailable right now.'}
        </div>

        <button
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting || !isFirebaseConfigured}
        >
          {isSubmitting
            ? 'Saving Request...'
            : isFirebaseConfigured
              ? 'Send Support Request'
              : 'Saving Unavailable'}
        </button>
      </div>
    </form>
  )
}

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { auth } from '@/lib/firebase/client'
import { authErrorMessage } from './authErrors'

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
})

type Values = z.infer<typeof schema>

/**
 * Email + password. `mode="sign-in"` is for existing accounts;
 * `mode="sign-up"` creates one (only offered inside the invite flow).
 */
export function EmailPasswordForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [showPassword, setShowPassword] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    if (!auth) return
    try {
      if (mode === 'sign-up') await createUserWithEmailAndPassword(auth, email, password)
      else await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      const message = authErrorMessage(error)
      if (message) toast.error(message)
    }
  })

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="relative">
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            hint={mode === 'sign-up' ? 'At least 8 characters.' : undefined}
            error={errors.password?.message}
            className="pr-12"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-[30px] inline-flex h-11 w-11 items-center justify-center rounded-control text-muted hover:text-navy"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <Button type="submit" block size="lg" loading={isSubmitting}>
          {mode === 'sign-up' ? 'Create account' : 'Sign in'}
        </Button>
        {mode === 'sign-in' && (
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="mx-auto block min-h-[44px] px-2 text-[15px] font-bold text-navy-light"
          >
            Forgot your password?
          </button>
        )}
      </form>
      <ResetPasswordModal open={resetOpen} onClose={() => setResetOpen(false)} initialEmail={getValues('email')} />
    </>
  )
}

function ResetPasswordModal({
  open,
  onClose,
  initialEmail,
}: {
  open: boolean
  onClose: () => void
  initialEmail?: string
}) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const send = async () => {
    if (!auth) return
    const value = (email || initialEmail || '').trim()
    if (!value.includes('@')) {
      toast.error('Enter your email address first.')
      return
    }
    setBusy(true)
    try {
      await sendPasswordResetEmail(auth, value)
    } catch {
      // Don't reveal whether the email exists.
    } finally {
      setBusy(false)
      setSent(true)
    }
  }

  const close = () => {
    setSent(false)
    setEmail('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Reset your password"
      description={sent ? undefined : 'We’ll email you a link to choose a new password.'}
      footer={
        sent ? (
          <Button block onClick={close} className="sm:w-auto">
            Done
          </Button>
        ) : (
          <Button block onClick={send} loading={busy} className="sm:w-auto">
            Send reset link
          </Button>
        )
      }
    >
      {sent ? (
        <p className="text-[15px] text-ink-soft">
          If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.
        </p>
      ) : (
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          defaultValue={initialEmail}
          onChange={(event) => setEmail(event.target.value)}
        />
      )}
    </Modal>
  )
}

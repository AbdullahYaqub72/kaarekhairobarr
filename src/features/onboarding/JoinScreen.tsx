'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, CheckCircle2, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { BrandHero } from '@/components/shared/BrandHero'
import { TeamPicker } from '@/components/shared/TeamPicker'
import { Button } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { TextField } from '@/components/ui/Field'
import { useAuth } from '@/features/auth/AuthProvider'
import { EmailPasswordForm } from '@/features/auth/EmailPasswordForm'
import { GoogleButton, OrDivider } from '@/features/auth/GoogleButton'
import { api } from '@/lib/api/client'
import { errorMessage } from '@/lib/format'
import { formatInviteCode, normalizeInviteCode, profileSchema, type ProfileInput } from '@/lib/validation'
import type { InviteCheckResponse } from '@/types/models'
import { Stepper } from './Stepper'

const STEPS = ['Code', 'Account', 'Profile']
const STORAGE_KEY = 'kkb-invite-code'

function rememberCode(code: string | null) {
  try {
    if (code) sessionStorage.setItem(STORAGE_KEY, code)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Private mode etc. The flow still works within this page.
  }
}

function recallCode() {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function JoinScreen() {
  const searchParams = useSearchParams()
  const { firebaseUser, me, signOut } = useAuth()
  const [invite, setInvite] = useState<InviteCheckResponse | null>(null)

  const step = !invite ? 0 : !firebaseUser ? 1 : 2
  const returning = me?.profile && ['rejected', 'alumni'].includes(me.profile.status)

  return (
    <div className="min-h-[100dvh] bg-page">
      <BrandHero size="sm" eyebrow={returning ? 'Welcome back' : 'Join KKB'} title={STEPS_TITLES[step]!}>
        <Stepper steps={STEPS} current={step} />
      </BrandHero>

      <main className="relative z-10 mx-auto -mt-6 max-w-md px-4 pb-12">
        <div className="animate-slide-up rounded-card bg-surface p-5 shadow-card">
          {step === 0 && (
            <CodeStep initialCode={searchParams.get('code') ?? recallCode()} onValid={setInvite} />
          )}
          {step === 1 && invite && <AccountStep invite={invite} />}
          {step === 2 && invite && <ProfileStep invite={invite} />}
        </div>

        {step === 2 && firebaseUser && (
          <p className="mt-5 text-center text-sm text-muted">
            Signed in as {firebaseUser.email}.{' '}
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex min-h-[44px] items-center gap-1 font-bold text-navy-light"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Switch account
            </button>
          </p>
        )}
        {step === 0 && (
          <p className="mt-6 text-center text-[15px] text-muted">
            Already a member?{' '}
            <Link href="/sign-in" className="inline-block min-h-[44px] py-2 font-bold text-navy-light">
              Sign in
            </Link>
          </p>
        )}
      </main>
    </div>
  )
}

const STEPS_TITLES = ['Enter your invite code', 'Create your account', 'Tell us about you']

// ── Step 1: invite code ──

function CodeStep({
  initialCode,
  onValid,
}: {
  initialCode: string | null
  onValid: (invite: InviteCheckResponse) => void
}) {
  const [code, setCode] = useState(initialCode ? formatInviteCode(initialCode) : '')
  const [error, setError] = useState<string | undefined>()
  const [checking, setChecking] = useState(false)

  const check = useCallback(
    async (value: string) => {
      const clean = normalizeInviteCode(value)
      if (clean.length !== 8) {
        setError('Invite codes have 8 letters and numbers, like ABCD-2345.')
        return
      }
      setChecking(true)
      setError(undefined)
      try {
        const result = await api<InviteCheckResponse>('/api/invites/verify', { body: { code: clean } })
        rememberCode(result.code)
        onValid(result)
      } catch (err) {
        rememberCode(null)
        setError(errorMessage(err))
      } finally {
        setChecking(false)
      }
    },
    [onValid]
  )

  // A code in the link (?code=…) or from earlier in this session is checked automatically.
  useEffect(() => {
    if (initialCode) void check(initialCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void check(code)
      }}
    >
      <p className="text-[15px] text-ink-soft">
        An admin shared a code with you on WhatsApp. It works once and expires after a few days.
      </p>
      <TextField
        label="Invite code"
        value={code}
        onChange={(event) => {
          setCode(formatInviteCode(event.target.value))
          setError(undefined)
        }}
        placeholder="ABCD-2345"
        autoComplete="one-time-code"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={9}
        error={error}
        className="text-center font-mono text-xl font-bold tracking-[0.3em]"
      />
      <Button type="submit" block size="lg" loading={checking}>
        Continue <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Button>
    </form>
  )
}

// ── Step 2: account ──

function AccountStep({ invite }: { invite: InviteCheckResponse }) {
  const [hasAccount, setHasAccount] = useState(false)
  return (
    <div className="space-y-5">
      <CodeAccepted invite={invite} />
      <GoogleButton label="Continue with Google" />
      <OrDivider />
      <EmailPasswordForm key={hasAccount ? 'in' : 'up'} mode={hasAccount ? 'sign-in' : 'sign-up'} />
      <p className="text-center text-[15px] text-muted">
        {hasAccount ? 'New to KKB?' : 'Already made an account?'}{' '}
        <button
          type="button"
          onClick={() => setHasAccount((v) => !v)}
          className="inline-block min-h-[44px] font-bold text-navy-light"
        >
          {hasAccount ? 'Create one instead' : 'Sign in instead'}
        </button>
      </p>
    </div>
  )
}

function CodeAccepted({ invite }: { invite: InviteCheckResponse }) {
  return (
    <div className="flex items-center gap-3 rounded-control bg-success-bg px-4 py-3 text-[15px] text-success">
      <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>
        Code <strong className="font-mono">{formatInviteCode(invite.code)}</strong> accepted
        {invite.label ? ` for ${invite.label}` : ''}.
      </span>
    </div>
  )
}

// ── Step 3: profile ──

function ProfileStep({ invite }: { invite: InviteCheckResponse }) {
  const { firebaseUser, me, refresh } = useAuth()
  const previous = me?.profile
  const [teams, setTeams] = useState<string[]>(
    previous?.requestedTeams?.length ? previous.requestedTeams : invite.suggestedTeams
  )
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: previous?.fullName || firebaseUser?.displayName || '',
      phone: previous?.phone ?? '',
      department: previous?.department ?? '',
      batch: previous?.batch ?? '',
      skills: previous?.skills?.join(', ') ?? '',
    },
  })

  const onSubmit = handleSubmit(async (profile) => {
    setServerError(null)
    try {
      await api('/api/join', { body: { code: invite.code, profile, requestedTeams: teams } })
      rememberCode(null)
      toast.success('Welcome to KKB!')
      await refresh() // The guard then moves them on to the agreement.
    } catch (err) {
      setServerError(errorMessage(err))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {serverError && <Callout tone="danger">{serverError}</Callout>}
      <TextField
        label="Full name"
        autoComplete="name"
        hint="As you'd like it on your KKB profile. You'll type it again to sign the agreement."
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <TextField
        label="WhatsApp number"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="0300 1234567"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <TextField
        label="Department"
        optional
        placeholder="e.g. Computer Science"
        error={errors.department?.message}
        {...register('department')}
      />
      <TextField label="Batch" optional placeholder="e.g. 2023" error={errors.batch?.message} {...register('batch')} />
      <TeamPicker
        label="Teams you'd like to join"
        hint="An admin confirms your teams when approving you. Pick any that interest you."
        teams={invite.teams}
        value={teams}
        onChange={setTeams}
      />
      <TextField
        label="Skills"
        optional
        placeholder="e.g. Photography, Canva, Fundraising"
        hint="Separate with commas."
        error={errors.skills?.message}
        {...register('skills')}
      />
      <Button type="submit" block size="lg" loading={isSubmitting}>
        Continue to agreement <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Button>
    </form>
  )
}

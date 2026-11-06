'use client'

import clsx from 'clsx'
import { Check, Clock, KeyRound, LogOut, Mail, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { BrandHero } from '@/components/shared/BrandHero'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CONTACT_EMAIL } from '@/config/brand'
import { useAuth } from '@/features/auth/AuthProvider'
import { firstName, formatDate } from '@/lib/format'
import type { UserProfile } from '@/types/models'

export function StatusScreen() {
  const { me, refresh, signOut } = useAuth()
  const [checking, setChecking] = useState(false)
  const profile = me?.profile
  if (!profile) return null

  const check = async () => {
    setChecking(true)
    await refresh() // the guard moves them on if anything changed
    setChecking(false)
  }

  const copy = COPY[profile.status as keyof typeof COPY] ?? COPY.pending_approval

  return (
    <div className="min-h-[100dvh] bg-page">
      <BrandHero size="sm" eyebrow={copy.eyebrow} title={copy.title(profile)} />

      <main className="relative z-10 mx-auto -mt-6 max-w-md space-y-4 px-4 pb-12">
        <Card className="animate-slide-up space-y-5">
          <p className="text-[15px] leading-relaxed text-ink-soft">{copy.body}</p>

          {profile.status === 'pending_approval' && <PendingTimeline profile={profile} />}

          {profile.statusReason && profile.status !== 'pending_approval' && (
            <div className="rounded-r-control border-l-[3px] border-navy-light bg-callout px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-navy">Note from the admin</p>
              <p className="mt-1 text-[15px] text-ink-soft">{profile.statusReason}</p>
            </div>
          )}

          <div className="space-y-3">
            {profile.status === 'pending_approval' && (
              <Button block onClick={check} loading={checking}>
                <RefreshCw className="h-5 w-5" aria-hidden="true" /> Check again
              </Button>
            )}
            {(profile.status === 'rejected' || profile.status === 'alumni') && (
              <ButtonLink href="/join" block>
                <KeyRound className="h-5 w-5" aria-hidden="true" /> I have a new invite code
              </ButtonLink>
            )}
            {profile.status === 'suspended' && (
              <ButtonLink href={`mailto:${CONTACT_EMAIL}`} block external>
                <Mail className="h-5 w-5" aria-hidden="true" /> Contact KKB
              </ButtonLink>
            )}
            <Button block variant="secondary" onClick={() => void signOut()}>
              <LogOut className="h-5 w-5" aria-hidden="true" /> Sign out
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}

const COPY = {
  pending_approval: {
    eyebrow: 'Almost there',
    title: (p: UserProfile) => `Thanks, ${firstName(p.fullName)}!`,
    body: 'Your request to join KKB is with the admins. Once you’re approved, you’ll get full access to the app and your teams. This usually takes a day or two.',
  },
  rejected: {
    eyebrow: 'Membership',
    title: () => 'Your request wasn’t approved',
    body: 'An admin reviewed your request and couldn’t approve it this time. If you think this is a mistake, talk to the person who invited you.',
  },
  suspended: {
    eyebrow: 'Account paused',
    title: () => 'Your access is paused',
    body: 'An admin has temporarily paused your access to the KKB app. Reach out to KKB to sort it out.',
  },
  alumni: {
    eyebrow: 'KKB alumni',
    title: (p: UserProfile) => `Thank you, ${firstName(p.fullName)}`,
    body: 'You’re no longer an active member. Thank you for everything you did for KKB. If you’d like to come back, ask an admin for a new invite code.',
  },
}

function PendingTimeline({ profile }: { profile: UserProfile }) {
  const steps = [
    { label: 'Joined with invite code', detail: formatDate(profile.createdAt), done: true },
    { label: 'Signed the member agreement', detail: formatDate(profile.ndaSignedAt), done: true },
    { label: 'Admin approval', detail: 'Waiting', done: false },
  ]
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => (
        <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
          {index < steps.length - 1 && (
            <span className="absolute left-[13px] top-7 h-[calc(100%-20px)] w-0.5 bg-line" aria-hidden="true" />
          )}
          <span
            className={clsx(
              'relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
              step.done ? 'bg-navy text-gold' : 'bg-gold-soft text-gold-dark'
            )}
            aria-hidden="true"
          >
            {step.done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Clock className="h-4 w-4" />}
          </span>
          <div className="pt-0.5">
            <p className="font-bold text-navy">{step.label}</p>
            <p className="text-sm text-muted">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

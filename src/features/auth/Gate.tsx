'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Splash } from '@/components/layout/Splash'
import { BrandHero } from '@/components/shared/BrandHero'
import { Button } from '@/components/ui/Button'
import { useAuth } from './AuthProvider'

/**
 * Which part of the app a layout belongs to:
 * - guest:  welcome / sign-in (members are sent into the app)
 * - join:   the invite-code flow
 * - nda:    the agreement (anyone with an account in good standing)
 * - status: waiting / rejected / suspended / alumni screens
 * - member: the members' app (active + current agreement)
 * - admin:  admin pages (member + admin role)
 */
export type GateMode = 'guest' | 'join' | 'nda' | 'status' | 'member' | 'admin'

const BLOCKED = ['rejected', 'suspended', 'alumni']

export function Gate({ mode, children }: { mode: GateMode; children: React.ReactNode }) {
  const { status, firebaseUser, me, error, destination, isAdmin, refresh, signOut } = useAuth()
  const router = useRouter()
  const signedIn = Boolean(firebaseUser)
  const profile = me?.profile ?? null
  const failed = signedIn && Boolean(error)

  let redirect: string | null = null
  if (status === 'ready' && !failed) {
    switch (mode) {
      case 'guest':
        if (profile) redirect = destination
        break
      case 'join':
        if (profile && !['rejected', 'alumni'].includes(profile.status)) redirect = destination
        break
      case 'nda':
        if (!signedIn) redirect = '/sign-in'
        else if (!profile) redirect = '/join'
        else if (BLOCKED.includes(profile.status)) redirect = '/status'
        break
      case 'status':
        if (destination !== '/status') redirect = destination
        break
      case 'member':
        if (destination !== '/home') redirect = destination
        break
      case 'admin':
        if (destination !== '/home') redirect = destination
        else if (!isAdmin) redirect = '/home'
        break
    }
  }

  useEffect(() => {
    if (redirect) router.replace(redirect)
  }, [redirect, router])

  if (status === 'loading' || redirect) return <Splash />

  if (failed && mode !== 'guest' && mode !== 'join') {
    return (
      <div className="min-h-[100dvh] bg-page">
        <BrandHero size="sm" eyebrow="Connection problem" title="We couldn't load your account" />
        <div className="mx-auto -mt-6 max-w-md px-4">
          <div className="space-y-4 rounded-card bg-surface p-5 shadow-card">
            <p className="text-[15px] text-ink-soft">{error}</p>
            <Button block onClick={() => void refresh()}>
              Try again
            </Button>
            <Button block variant="secondary" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

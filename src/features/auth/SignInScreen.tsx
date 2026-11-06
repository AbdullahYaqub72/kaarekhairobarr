'use client'

import { KeyRound, LogOut } from 'lucide-react'
import Link from 'next/link'
import { BrandHero } from '@/components/shared/BrandHero'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { useAuth } from './AuthProvider'
import { EmailPasswordForm } from './EmailPasswordForm'
import { GoogleButton, OrDivider } from './GoogleButton'

export function SignInScreen() {
  const { firebaseUser, me, error, signOut, refresh } = useAuth()
  // Signed in with Firebase, but no KKB profile yet (or it failed to load).
  const signedInWithoutProfile = Boolean(firebaseUser) && !me?.profile

  return (
    <div className="min-h-[100dvh] bg-page">
      <BrandHero size="sm" eyebrow="Welcome back" title="Sign in to KKB" />

      <main className="relative z-10 mx-auto -mt-6 max-w-md px-4 pb-12">
        <div className="animate-slide-up space-y-5 rounded-card bg-surface p-5 shadow-card">
          {signedInWithoutProfile ? (
            error ? (
              <>
                <Callout tone="danger" title="We couldn't load your account">
                  {error}
                </Callout>
                <Button block onClick={() => void refresh()}>
                  Try again
                </Button>
                <Button block variant="secondary" onClick={() => void signOut()}>
                  <LogOut className="h-5 w-5" aria-hidden="true" /> Sign out
                </Button>
              </>
            ) : (
              <>
                <Callout tone="info" title="You're not a KKB member yet">
                  You&apos;re signed in as <strong>{firebaseUser?.email}</strong>, but this account hasn&apos;t
                  joined KKB. Use your invite code to finish joining.
                </Callout>
                <ButtonLink href="/join" block size="lg">
                  <KeyRound className="h-5 w-5" aria-hidden="true" /> Join with an invite code
                </ButtonLink>
                <Button block variant="secondary" onClick={() => void signOut()}>
                  Use a different account
                </Button>
              </>
            )
          ) : (
            <>
              <GoogleButton />
              <OrDivider />
              <EmailPasswordForm mode="sign-in" />
            </>
          )}
        </div>

        {!signedInWithoutProfile && (
          <p className="mt-6 text-center text-[15px] text-muted">
            New here?{' '}
            <Link href="/join" className="inline-block min-h-[44px] py-2 font-bold text-navy-light">
              Join with an invite code
            </Link>
          </p>
        )}
      </main>
    </div>
  )
}

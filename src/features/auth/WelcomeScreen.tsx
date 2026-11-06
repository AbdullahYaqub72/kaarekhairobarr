import { KeyRound, LogIn } from 'lucide-react'
import { BrandHero } from '@/components/shared/BrandHero'
import { ButtonLink } from '@/components/ui/Button'
import { BRAND_CONTEXT, BRAND_NAME, BRAND_SLOGAN_EN, CONTACT_EMAIL } from '@/config/brand'

/** First screen for signed-out visitors. */
export function WelcomeScreen() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-page">
      <BrandHero
        size="lg"
        eyebrow="KKB Members"
        title={BRAND_NAME}
        showTagline
        subtitle={`${BRAND_SLOGAN_EN}. The home for KKB volunteers: your teams, your work, and the people you do it with.`}
      />

      <main className="relative z-10 mx-auto -mt-8 w-full max-w-md flex-1 px-4">
        <div className="animate-slide-up space-y-3 rounded-card bg-surface p-5 shadow-card">
          <ButtonLink href="/sign-in" block size="lg">
            <LogIn className="h-5 w-5" aria-hidden="true" />
            Sign in
          </ButtonLink>
          <ButtonLink href="/join" block size="lg" variant="secondary">
            <KeyRound className="h-5 w-5" aria-hidden="true" />I have an invite code
          </ButtonLink>
          <p className="pt-1 text-center text-sm text-muted">
            New to KKB? Ask a team lead or an admin for an invite code.
          </p>
        </div>
      </main>

      <footer className="pb-safe px-4 py-8 text-center text-sm text-muted">
        <p>{BRAND_CONTEXT}</p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="mt-1 inline-block min-h-[44px] py-2 font-bold text-navy-light">
          {CONTACT_EMAIL}
        </a>
      </footer>
    </div>
  )
}

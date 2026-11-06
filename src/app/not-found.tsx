import { BrandHero } from '@/components/shared/BrandHero'
import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-page">
      <BrandHero size="sm" eyebrow="404" title="This page doesn't exist" />
      <div className="mx-auto -mt-6 max-w-md px-4">
        <div className="rounded-card bg-surface p-5 shadow-card">
          <p className="mb-4 text-[15px] text-ink-soft">The link may be old, or the page has moved.</p>
          <ButtonLink href="/" block>
            Go to KKB home
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}

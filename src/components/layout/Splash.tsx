import { BrandLogo } from '@/components/shared/BrandLogo'
import { Spinner } from '@/components/ui/Spinner'

/** Full-screen navy splash shown while we work out who is signed in. */
export function Splash({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-navy" role="status">
      <BrandLogo width={88} priority />
      <Spinner className="h-6 w-6 text-gold" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

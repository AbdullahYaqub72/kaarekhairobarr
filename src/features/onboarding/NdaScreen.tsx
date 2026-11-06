'use client'

import clsx from 'clsx'
import { ArrowDown, ArrowLeft, Check, FileSignature } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { BrandHero } from '@/components/shared/BrandHero'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/Field'
import { BRAND_NAME } from '@/config/brand'
import { NDA } from '@/config/nda'
import { useAuth } from '@/features/auth/AuthProvider'
import { api } from '@/lib/api/client'
import { errorMessage, formatDateTime } from '@/lib/format'
import { namesMatch } from '@/lib/validation'

export function NdaScreen() {
  const { me, destination } = useAuth()
  const profile = me?.profile
  if (!profile || !me) return null

  const mustSign = profile.ndaVersionSigned !== me.ndaVersion
  const isUpdate = mustSign && profile.ndaVersionSigned !== null

  return (
    <div className="min-h-[100dvh] bg-page">
      <BrandHero
        size="sm"
        eyebrow={`Version ${NDA.version}`}
        title={NDA.title}
        subtitle={
          mustSign
            ? isUpdate
              ? 'The agreement has been updated. Please read and sign the new version to continue.'
              : 'Last step before an admin reviews your request. Please read this carefully.'
            : undefined
        }
      />

      <main className="relative z-10 mx-auto -mt-6 max-w-2xl space-y-4 px-4 pb-16">
        {mustSign ? (
          <Callout tone="info" className="bg-surface shadow-card">
            <span className="flex items-center justify-between gap-3">
              It takes about 3 minutes to read.
              <a href="#sign" className="inline-flex min-h-[44px] items-center gap-1 font-bold text-navy-light">
                Jump to sign <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </span>
          </Callout>
        ) : (
          <Callout tone="success" title="You've signed this agreement" className="bg-surface shadow-card">
            Signed on {formatDateTime(profile.ndaSignedAt)}.
          </Callout>
        )}

        <Card as="article" className="sm:p-7">
          <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-dark">{BRAND_NAME}</p>
            {NDA.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {NDA.sections.map((section) => (
            <section key={section.heading} className="mt-7">
              <h2 className="text-base text-navy">{section.heading}</h2>
              {section.intro && <p className="mt-2 text-[15px] text-ink-soft">{section.intro}</p>}
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="mt-3 space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={3} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </Card>

        {mustSign ? (
          <SignPanel fullName={profile.fullName} />
        ) : (
          <ButtonLink href={destination === '/nda' ? '/home' : destination} block variant="secondary">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Back
          </ButtonLink>
        )}
      </main>
    </div>
  )
}

function SignPanel({ fullName }: { fullName: string }) {
  const { refresh } = useAuth()
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameOk = namesMatch(typedName, fullName)
  const canSign = agreed && nameOk

  const sign = async () => {
    if (!canSign) return
    setBusy(true)
    setError(null)
    try {
      await api('/api/nda/sign', { body: { version: NDA.version, typedName, agreed: true } })
      toast.success('Agreement signed. Thank you!')
      await refresh()
      router.replace('/') // routes them to the right place for their status
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <Card id="sign" className="scroll-mt-4 space-y-5 border-t-4 border-gold sm:p-7">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy text-gold">
          <FileSignature className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-lg text-navy">Sign the agreement</h2>
      </div>

      {error && <Callout tone="danger">{error}</Callout>}

      <button
        type="button"
        role="checkbox"
        aria-checked={agreed}
        onClick={() => setAgreed((v) => !v)}
        className={clsx(
          'flex w-full items-start gap-3 rounded-control border-2 px-4 py-3.5 text-left transition',
          agreed ? 'border-navy bg-navy-50' : 'border-line hover:border-navy-100'
        )}
      >
        <span
          className={clsx(
            'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border-2',
            agreed ? 'border-navy bg-navy text-white' : 'border-navy-100'
          )}
          aria-hidden="true"
        >
          {agreed && <Check className="h-4 w-4" strokeWidth={3} />}
        </span>
        <span className="text-[15px] font-bold text-navy">
          I have read and agree to the {NDA.title} (version {NDA.version}).
        </span>
      </button>

      <TextField
        label="Type your full name to sign"
        value={typedName}
        onChange={(event) => setTypedName(event.target.value)}
        autoComplete="off"
        placeholder={fullName}
        hint={`Exactly as on your profile: ${fullName}`}
        error={typedName.length > 2 && !nameOk ? `This must match your profile name: ${fullName}` : undefined}
        className="font-semibold"
      />

      <Button block size="lg" onClick={sign} disabled={!canSign} loading={busy}>
        Sign agreement
      </Button>
      <p className="text-center text-sm text-muted">
        Your typed name, the date and time, and the version are saved as your signature.
      </p>
    </Card>
  )
}

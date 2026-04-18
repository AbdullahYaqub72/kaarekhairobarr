import clsx from 'clsx'
import { ArrowUpRight, CircleDollarSign, HeartHandshake } from 'lucide-react'
import type { Campaign } from '@/types/home'

interface FeaturedCampaignCardProps {
  campaign: Campaign
}

const accentStyles: Record<Campaign['accent'], string> = {
  forest: 'from-forest-100 via-white to-forest-50',
  cream: 'from-cream-100 via-white to-cream-50',
  clay: 'from-clay-100 via-white to-clay-50',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function FeaturedCampaignCard({ campaign }: FeaturedCampaignCardProps) {
  const progress =
    campaign.targetAmount > 0
      ? Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100))
      : 0

  return (
    <article
      className={clsx(
        'surface-panel group relative overflow-hidden bg-gradient-to-br p-6 transition duration-300 hover:-translate-y-1',
        accentStyles[campaign.accent]
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-white/85 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ink-700">
          {campaign.category}
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-cream-50 transition duration-300 group-hover:bg-forest-700">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink-900">
          {campaign.title}
        </h3>
        <p className="text-sm leading-7 text-ink-600">{campaign.shortDescription}</p>
      </div>

      <div className="mt-6 rounded-3xl bg-white/80 p-4">
        <div className="mb-3 flex items-center justify-between text-sm text-ink-600">
          <span>Raised so far</span>
          <span className="font-semibold text-ink-900">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-ink-900/10">
          <div
            className="h-2 rounded-full bg-ink-900 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-forest-50 px-4 py-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-forest-700">
              <CircleDollarSign className="h-4 w-4" />
              Target
            </p>
            <p className="mt-2 text-sm font-semibold text-ink-900">
              {formatCurrency(campaign.targetAmount)}
            </p>
          </div>
          <div className="rounded-2xl bg-cream-50 px-4 py-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-clay-700">
              <HeartHandshake className="h-4 w-4" />
              Impact
            </p>
            <p className="mt-2 text-sm font-semibold text-ink-900">
              {campaign.beneficiariesLabel}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-ink-700">
          {formatCurrency(campaign.raisedAmount)} committed so far
        </p>
      </div>
    </article>
  )
}

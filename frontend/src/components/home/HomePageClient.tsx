'use client'

import Link from 'next/link'
import { startTransition, useEffect, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  CalendarRange,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import MonthlyGoalCard from '@/components/goals/MonthlyGoalCard'
import BrandLogo from '@/components/BrandLogo'
import EventTimelineCard from '@/components/home/EventTimelineCard'
import FeaturedCampaignCard from '@/components/home/FeaturedCampaignCard'
import ImpactMetricCard from '@/components/home/ImpactMetricCard'
import SectionHeading from '@/components/home/SectionHeading'
import SupportForm from '@/components/home/SupportForm'
import TestimonialCard from '@/components/home/TestimonialCard'
import { BRAND_LOCATION, BRAND_SHORT_CONTEXT, BRAND_SLOGAN } from '@/lib/brand'
import { FALLBACK_HOME_CONTENT, getHomeContent } from '@/lib/home-content'
import {
  formatCompactCurrency,
  getCurrentMonthLabel,
  getCurrentMonthKey,
  getMonthlyGoals,
} from '@/lib/monthly-goals'
import type { MonthlyGoal } from '@/types/goals'
import type { HomeContent } from '@/types/home'

const deliverySteps = [
  {
    step: 'Listen',
    description:
      'Need comes in through local referrals, volunteers, clinics, and families already known to the network.',
  },
  {
    step: 'Verify',
    description:
      'Urgency, household context, and the right type of relief are checked before resources go out.',
  },
  {
    step: 'Deliver',
    description:
      'Support is routed into campaigns, event days, or direct aid with follow-up to keep care consistent.',
  },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}

export default function HomePageClient() {
  const [content, setContent] = useState<HomeContent>(FALLBACK_HOME_CONTENT)
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadContent = async () => {
      const [nextContent, nextMonthlyGoals] = await Promise.all([
        getHomeContent(),
        getMonthlyGoals(getCurrentMonthKey()),
      ])

      if (!isActive) {
        return
      }

      startTransition(() => {
        setContent(nextContent)
        setMonthlyGoals(nextMonthlyGoals)
        setIsLoading(false)
      })
    }

    loadContent()

    return () => {
      isActive = false
    }
  }, [])

  const { site, campaigns, events, testimonials } = content
  const leadCampaign = campaigns[0]
  const leadEvent = events[0]
  const visibleCampaigns = campaigns.slice(0, 3)
  const visibleEvents = events.slice(0, 3)
  const visibleTestimonials = testimonials.slice(0, 3)
  const visibleMonthlyGoals = monthlyGoals.slice(0, 3)
  const currentMonthTarget = monthlyGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const currentMonthRaised = monthlyGoals.reduce((sum, goal) => sum + goal.raisedAmount, 0)
  const currentMonthRemaining = monthlyGoals.reduce((sum, goal) => sum + goal.remainingAmount, 0)

  return (
    <div className="pb-10">
      <section id="top" className="section-shell relative overflow-hidden pt-8 sm:pt-14 lg:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-mesh-radial opacity-90" />
        <div className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full bg-clay-200/30 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-52 h-64 w-64 rounded-full bg-forest-200/30 blur-3xl" />

        <div className="container-custom relative z-10 mb-10 sm:mb-12">
          <div className="mx-auto flex max-w-4xl animate-fade-up flex-col items-center text-center">
            <span className="eyebrow bg-white/85 text-ink-700">{BRAND_LOCATION}</span>
            <BrandLogo size="lg" className="mt-6" priority />
            <p className="mt-5 px-2 text-[0.68rem] uppercase tracking-[0.24em] text-ink-500 sm:mt-6 sm:text-sm sm:tracking-[0.34em]">
              {BRAND_SHORT_CONTEXT}
            </p>
            <h2
              lang="ur"
              dir="rtl"
              className="urdu-display mt-4 text-center text-3xl font-semibold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl"
            >
              {BRAND_SLOGAN}
            </h2>
          </div>
        </div>

        <div className="container-custom relative z-10 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="animate-fade-up">
            <div className="mb-5 flex flex-wrap items-center gap-3 sm:mb-6">
              <span className="eyebrow">
                <Sparkles className="h-4 w-4" />
                {site.badge}
              </span>
            </div>

            <h1 className="max-w-4xl font-display text-[2.3rem] font-semibold leading-[0.98] tracking-[-0.035em] text-ink-900 sm:text-6xl sm:leading-[0.93] sm:tracking-[-0.045em] lg:text-[5.4rem]">
              {site.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-ink-600 sm:mt-6 sm:text-lg sm:leading-8">
              {site.heroSubtitle}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Link href="/#support" className="btn-primary">
                Start Supporting
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/#campaigns" className="btn-outline">
                Browse Active Campaigns
              </Link>
            </div>

            <div className="mt-6 flex flex-col items-start gap-2.5 text-sm text-ink-600 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
              <span className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-forest-700" />
                Human-centered giving
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-clay-700" />
                Clear funding progress
              </span>
              <span className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-forest-700" />
                Local action in Lahore
              </span>
            </div>
          </div>

          <div className="animate-fade-up lg:pl-8">
            <div className="surface-panel relative overflow-hidden p-5 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-forest-100/40 via-white to-cream-100/40" />
              <div className="relative">
                <span className="eyebrow bg-white/85 text-clay-700">Current Focus</span>
                <h2 className="mt-4 font-display text-[1.95rem] font-semibold tracking-[-0.03em] text-ink-900 sm:mt-5 sm:text-4xl sm:tracking-[-0.04em]">
                  {leadCampaign.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-ink-600 sm:leading-7">
                  {leadCampaign.shortDescription}
                </p>

                <div className="mt-6 rounded-[24px] bg-ink-900 p-5 text-cream-50">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-cream-100/60">
                        Raised so far
                      </p>
                      <p className="mt-3 break-words font-display text-[2.15rem] font-semibold leading-none sm:text-4xl">
                        {formatCurrency(leadCampaign.raisedAmount)}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs uppercase tracking-[0.22em] text-cream-100/60">
                        Goal
                      </p>
                      <p className="mt-3 text-lg font-semibold">
                        {formatCurrency(leadCampaign.targetAmount)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-cream-100/75">
                    {leadCampaign.beneficiariesLabel}
                  </p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-forest-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">
                      Next field date
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
                      <CalendarRange className="h-4 w-4 text-forest-700" />
                      {formatDate(leadEvent.eventDate)}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-ink-600">{leadEvent.title}</p>
                  </div>
                  <div className="hidden rounded-[24px] bg-cream-50 p-4 sm:block">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
                      What this rebuild adds
                    </p>
                    <p className="mt-3 text-sm leading-7 text-ink-700">
                      Stronger hierarchy, reusable cards, and data-backed sections that can stay
                      current without redesigning the page again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom relative z-10 mt-8 grid gap-3 sm:mt-10 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
          {site.statCards.map((stat, index) => (
            <ImpactMetricCard
              key={`${stat.label}-${index}`}
              stat={stat}
              highlighted={index === 0}
            />
          ))}
        </div>
      </section>

      <section id="goals" className="section-shell">
        <div className="container-custom">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Current Month Goals"
              title="What this month needs, what has come in, and what is still left."
              description="These cards stay aligned with the same monthly goal records used for the protected management flow and the statistics page."
            />

            <Link href="/statistics" className="btn-secondary">
              View Statistics
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="surface-panel p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
                {getCurrentMonthLabel()}
              </p>
              <p className="mt-4 break-words font-display text-[2.2rem] font-semibold leading-none text-ink-900 sm:text-4xl">
                {formatCompactCurrency(currentMonthTarget)}
              </p>
              <p className="mt-3 text-sm leading-7 text-ink-600">Combined target for this month.</p>
            </div>
            <div className="surface-panel p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Collected so far</p>
              <p className="mt-4 break-words font-display text-[2.2rem] font-semibold leading-none text-ink-900 sm:text-4xl">
                {formatCompactCurrency(currentMonthRaised)}
              </p>
              <p className="mt-3 text-sm leading-7 text-ink-600">
                Live raised amount across current month goals.
              </p>
            </div>
            <div className="surface-panel p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Still left</p>
              <p className="mt-4 break-words font-display text-[2.2rem] font-semibold leading-none text-ink-900 sm:text-4xl">
                {formatCompactCurrency(currentMonthRemaining)}
              </p>
              <p className="mt-3 text-sm leading-7 text-ink-600">
                Remaining amount needed to complete the month.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 surface-panel p-8 text-sm text-ink-600">Loading current month goals...</div>
          ) : monthlyGoals.length > 0 ? (
            <div className="mt-8 grid gap-5 xl:grid-cols-3">
              {visibleMonthlyGoals.map((goal, index) => (
                <div key={goal.id} className={index > 1 ? 'hidden xl:block' : ''}>
                  <MonthlyGoalCard goal={goal} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 surface-panel p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                Nothing saved yet
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-ink-900">
                The current month goals will appear here as soon as they are entered.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-ink-600">
                Once the records are updated, they will appear here on the landing page and also
                feed the charts on the statistics page.
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="campaigns" className="section-shell">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Featured Campaigns"
            title="Programs with clearer priorities, stronger visuals, and room to contribute."
            description="Each card highlights the funding goal, current momentum, and the real-world outcome attached to the next donation."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {visibleCampaigns.map((campaign, index) => (
              <div key={campaign.id} className={index > 1 ? 'hidden lg:block' : ''}>
                <FeaturedCampaignCard campaign={campaign} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="section-shell">
        <div className="container-custom">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="surface-panel bg-ink-900 p-6 sm:p-8 text-cream-50">
              <span className="eyebrow bg-white/10 text-cream-50">How We Work</span>
              <h2 className="mt-5 font-display text-[2.2rem] font-semibold tracking-[-0.035em] sm:text-4xl sm:tracking-[-0.04em]">
                Better experience, same mission.
              </h2>
              <p className="mt-5 text-sm leading-8 text-cream-100/78">{site.mission}</p>
              <p className="mt-4 text-sm leading-8 text-cream-100/72">{site.vision}</p>

              <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-100/60">
                  Promise
                </p>
                <p className="mt-3 text-sm leading-7 text-cream-100/78">
                  The goal is not just to “look modern.” It is to help families, donors, and
                  volunteers understand what needs attention and how they can step in.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {site.principles.map((principle) => (
                <article key={principle.title} className="surface-panel p-5 sm:p-6">
                  <span className="rounded-full bg-cream-100 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-clay-700">
                    {principle.tag}
                  </span>
                  <h3 className="mt-5 font-display text-[2rem] font-semibold tracking-[-0.03em] text-ink-900 sm:text-3xl">
                    {principle.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-ink-600">
                    {principle.description}
                  </p>
                </article>
              ))}

              <article className="surface-panel p-5 sm:col-span-2 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                  Relief Flow
                </p>
                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  {deliverySteps.map((item, index) => (
                    <div key={item.step} className="rounded-[24px] bg-cream-50 p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-cream-50">
                          {index + 1}
                        </span>
                        <h3 className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">
                          {item.step}
                        </h3>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-ink-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="section-shell">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <SectionHeading
                eyebrow="Field Calendar"
                title="Upcoming events now feel like real touchpoints, not placeholders."
                description="This section gives the site a sense of movement and helps supporters understand when field activity is happening next."
              />

              <div className="mt-8 space-y-4 sm:mt-10 sm:space-y-5">
                {visibleEvents.map((event, index) => (
                  <div key={event.id} className={index > 1 ? 'hidden lg:block' : ''}>
                    <EventTimelineCard event={event} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5 lg:pt-20">
              <div className="surface-panel p-6 sm:p-8">
                <span className="eyebrow bg-forest-50">Why This Helps</span>
                <h3 className="mt-5 font-display text-[2.2rem] font-semibold tracking-[-0.035em] text-ink-900 sm:text-4xl sm:tracking-[-0.04em]">
                  Donors trust momentum they can see.
                </h3>
                <p className="mt-4 text-sm leading-8 text-ink-600">
                  Upcoming events make the organization feel active, organized, and close to the
                  people it serves. That is especially important for welfare work.
                </p>
              </div>

              <div className="surface-panel bg-gradient-to-br from-clay-100/70 via-white to-cream-50 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
                  Next stop
                </p>
                <h3 className="mt-4 font-display text-[2rem] font-semibold tracking-[-0.035em] text-ink-900 sm:text-3xl sm:tracking-[-0.04em]">
                  {leadEvent.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink-600">{leadEvent.description}</p>
                <div className="mt-6 rounded-[24px] bg-white/85 p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-ink-900">
                    <BadgeCheck className="h-4 w-4 text-forest-700" />
                    {formatDate(leadEvent.eventDate)} at {leadEvent.location}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stories" className="section-shell">
        <div className="container-custom">
          <SectionHeading
            eyebrow="Stories & Trust"
            title="Testimonials now support the design instead of looking like filler."
            description="Short, focused stories create emotional proof without overwhelming the page."
            align="center"
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-3 sm:mt-10">
            {visibleTestimonials.map((testimonial, index) => (
              <div key={testimonial.id} className={index > 1 ? 'hidden lg:block' : ''}>
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="support" className="section-shell">
        <div className="container-custom">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-panel bg-gradient-to-br from-white via-cream-50 to-forest-50 p-6 sm:p-10">
              <SectionHeading
                eyebrow="Support Request"
                title="Share support interest directly with the team."
                description="This form collects donor, volunteer, and partnership interest in one clear place."
              />

              <div className="mt-8">
                <SupportForm />
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-panel p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                  Contact
                </p>
                <h3 className="mt-4 font-display text-[2rem] font-semibold tracking-[-0.035em] text-ink-900 sm:text-3xl sm:tracking-[-0.04em]">
                  Keep the next step easy.
                </h3>
                <div className="mt-6 grid gap-4 text-sm leading-7 text-ink-600">
                  <div className="rounded-[24px] bg-cream-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
                      Contact
                    </p>
                    <p className="mt-2">{site.contactEmail}</p>
                    <p>{site.contactPhone}</p>
                    <p>{site.contactAddress}</p>
                  </div>

                  <div className="rounded-[24px] bg-forest-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">
                      Donation Account
                    </p>
                    <p className="mt-2 font-semibold text-ink-900">{site.donationProvider}</p>
                    <p>Account Number: {site.donationAccountNumber}</p>
                  </div>

                  <div className="rounded-[24px] bg-white/85 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                      Instagram
                    </p>
                    <Link
                      href={site.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm font-semibold text-forest-700 hover:text-forest-800"
                    >
                      @kaare_khair_o_barr
                    </Link>
                  </div>
                </div>
              </div>

              <div className="surface-panel bg-ink-900 p-6 sm:p-8 text-cream-50">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-100/60">
                  What This Upgrade Unlocks
                </p>
                <div className="mt-5 space-y-3 text-sm leading-7 text-cream-100/78">
                  <p>Homepage content can stay fresh without reshaping the layout every time.</p>
                  <p>Support interest, volunteer follow-ups, and donor leads can land in one place.</p>
                  <p>The stronger visual structure makes the organization feel more trustworthy at first glance.</p>
                </div>
              </div>

              <div className="surface-panel p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
                  Suggested next move
                </p>
                <p className="mt-4 text-sm leading-8 text-ink-600">
                  Keep the monthly goals up to date, refresh the statistics view regularly, and
                  use the cleaner structure to make the site feel clear, credible, and easy to act on.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

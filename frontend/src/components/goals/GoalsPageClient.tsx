'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CalendarClock, LockKeyhole, LogOut, Sparkles, Star } from 'lucide-react'
import { startTransition, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  authenticateAdmin,
  clearAdminSession,
  hasUnlockedAdminAccess,
  isAdminAuthenticated,
} from '@/lib/admin-auth'
import CampaignForm from '@/components/goals/CampaignForm'
import EventForm from '@/components/goals/EventForm'
import MonthlyGoalCard from '@/components/goals/MonthlyGoalCard'
import MonthlyGoalForm from '@/components/goals/MonthlyGoalForm'
import TestimonialForm from '@/components/goals/TestimonialForm'
import EventTimelineCard from '@/components/home/EventTimelineCard'
import FeaturedCampaignCard from '@/components/home/FeaturedCampaignCard'
import SectionHeading from '@/components/home/SectionHeading'
import TestimonialCard from '@/components/home/TestimonialCard'
import {
  deleteCampaignItem,
  deleteEventItem,
  deleteTestimonialItem,
  getAllCampaigns,
  getAllEvents,
  getAllTestimonials,
} from '@/lib/home-content'
import {
  deleteMonthlyGoal,
  formatCompactCurrency,
  getCurrentMonthKey,
  getCurrentMonthLabel,
  getMonthlyGoals,
} from '@/lib/monthly-goals'
import type { MonthlyGoal } from '@/types/goals'
import type { Campaign, EventItem, Testimonial } from '@/types/home'

export default function GoalsPageClient() {
  const currentMonthKey = getCurrentMonthKey()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [goals, setGoals] = useState<MonthlyGoal[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accessState, setAccessState] = useState<'checking' | 'login' | 'authorized'>('checking')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [campaignActionId, setCampaignActionId] = useState<string | null>(null)
  const [goalActionId, setGoalActionId] = useState<string | null>(null)
  const [eventActionId, setEventActionId] = useState<string | null>(null)
  const [testimonialActionId, setTestimonialActionId] = useState<string | null>(null)
  const router = useRouter()

  const loadCampaigns = async () => {
    const nextCampaigns = await getAllCampaigns()

    startTransition(() => {
      setCampaigns(nextCampaigns)
    })
  }

  const loadGoals = async () => {
    const nextGoals = await getMonthlyGoals()

    startTransition(() => {
      setGoals(nextGoals)
    })
  }

  const loadEvents = async () => {
    const nextEvents = await getAllEvents()

    startTransition(() => {
      setEvents(nextEvents)
    })
  }

  const loadTestimonials = async () => {
    const nextTestimonials = await getAllTestimonials()

    startTransition(() => {
      setTestimonials(nextTestimonials)
    })
  }

  const loadDashboard = async () => {
    const [nextCampaigns, nextGoals, nextEvents, nextTestimonials] = await Promise.all([
      getAllCampaigns(),
      getMonthlyGoals(),
      getAllEvents(),
      getAllTestimonials(),
    ])

    startTransition(() => {
      setCampaigns(nextCampaigns)
      setGoals(nextGoals)
      setEvents(nextEvents)
      setTestimonials(nextTestimonials)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (!hasUnlockedAdminAccess()) {
      router.replace('/')
      return
    }

    if (isAdminAuthenticated()) {
      setAccessState('authorized')
      void loadDashboard()
      return
    }

    setAccessState('login')
    setIsLoading(false)
  }, [currentMonthKey, router])

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!authenticateAdmin(username.trim(), password)) {
      setLoginError('Incorrect username or password.')
      return
    }

    setLoginError('')
    setAccessState('authorized')
    setIsLoading(true)
    void loadDashboard()
  }

  const handleLogout = () => {
    clearAdminSession()
    router.replace('/')
  }

  const handleCampaignSaved = async () => {
    await loadCampaigns()
    setEditingCampaign(null)
  }

  const handleGoalSaved = async () => {
    await loadGoals()
    setEditingGoal(null)
  }

  const handleEventSaved = async () => {
    await loadEvents()
    setEditingEvent(null)
  }

  const handleTestimonialSaved = async () => {
    await loadTestimonials()
    setEditingTestimonial(null)
  }

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (!window.confirm(`Delete "${campaign.title}"? This cannot be undone.`)) {
      return
    }

    try {
      setCampaignActionId(campaign.id)
      await deleteCampaignItem(campaign.id)
      toast.success('Campaign deleted.')
      if (editingCampaign?.id === campaign.id) {
        setEditingCampaign(null)
      }
      await loadCampaigns()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to delete this campaign right now.'
      )
    } finally {
      setCampaignActionId(null)
    }
  }

  const handleDeleteGoal = async (goal: MonthlyGoal) => {
    if (!window.confirm(`Delete "${goal.title}"? This cannot be undone.`)) {
      return
    }

    try {
      setGoalActionId(goal.id)
      await deleteMonthlyGoal(goal.id)
      toast.success('Goal deleted.')
      if (editingGoal?.id === goal.id) {
        setEditingGoal(null)
      }
      await loadGoals()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete this goal right now.')
    } finally {
      setGoalActionId(null)
    }
  }

  const handleDeleteEvent = async (event: EventItem) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) {
      return
    }

    try {
      setEventActionId(event.id)
      await deleteEventItem(event.id)
      toast.success('Event deleted.')
      if (editingEvent?.id === event.id) {
        setEditingEvent(null)
      }
      await loadEvents()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete this event right now.')
    } finally {
      setEventActionId(null)
    }
  }

  const handleDeleteTestimonial = async (testimonial: Testimonial) => {
    if (!window.confirm(`Delete "${testimonial.name}"? This cannot be undone.`)) {
      return
    }

    try {
      setTestimonialActionId(testimonial.id)
      await deleteTestimonialItem(testimonial.id)
      toast.success('Testimonial deleted.')
      if (editingTestimonial?.id === testimonial.id) {
        setEditingTestimonial(null)
      }
      await loadTestimonials()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to delete this testimonial right now.'
      )
    } finally {
      setTestimonialActionId(null)
    }
  }

  const currentMonthGoals = goals.filter((goal) => goal.monthKey === currentMonthKey)
  const featuredCampaignCount = campaigns.filter((campaign) => campaign.featured).length
  const activeCampaignCount = campaigns.filter(
    (campaign) => campaign.raisedAmount < campaign.targetAmount
  ).length
  const currentMonthTarget = currentMonthGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const currentMonthRaised = currentMonthGoals.reduce((sum, goal) => sum + goal.raisedAmount, 0)
  const currentMonthRemaining = currentMonthGoals.reduce((sum, goal) => sum + goal.remainingAmount, 0)
  const completedCount = currentMonthGoals.filter((goal) => goal.isTargetMet).length
  const featuredEventsCount = events.filter((event) => event.featured).length
  const upcomingEventsCount = events.filter(
    (event) => event.status.toLowerCase() === 'upcoming'
  ).length
  const featuredTestimonialsCount = testimonials.filter((testimonial) => testimonial.featured).length

  if (accessState === 'checking') {
    return (
      <div className="pb-12">
        <section className="section-shell pt-14">
          <div className="container-custom">
            <div className="surface-panel mx-auto max-w-2xl p-10 text-center">
              <p className="text-sm text-ink-600">Checking admin access...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (accessState === 'login') {
    return (
      <div className="pb-12">
        <section className="section-shell relative overflow-hidden pt-8 sm:pt-14">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-mesh-radial opacity-90" />

          <div className="container-custom relative z-10">
            <div className="surface-panel mx-auto max-w-xl bg-gradient-to-br from-white via-cream-50 to-forest-50 p-6 sm:p-10">
              <div className="text-center">
                <span className="eyebrow bg-white/85 text-ink-700">
                  <LockKeyhole className="h-4 w-4" />
                  Admin Access
                </span>
                <h1 className="mt-6 font-display text-[2.5rem] font-semibold tracking-[-0.04em] text-ink-900 sm:text-5xl sm:tracking-[-0.05em]">
                  Manage Campaigns, Goals, Events and Testimonials
                </h1>
                <p className="mt-4 text-sm leading-8 text-ink-600">
                  This page is hidden from the public website. Sign in to manage landing-page
                  campaigns, monthly goals, featured events, upcoming dates, and testimonials.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="label" htmlFor="adminUsername">
                    Username
                  </label>
                  <input
                    id="adminUsername"
                    className="field"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="adminPassword">
                    Password
                  </label>
                  <input
                    id="adminPassword"
                    type="password"
                    className="field"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                {loginError ? <p className="text-sm text-clay-700">{loginError}</p> : null}

                <button className="btn-primary w-full justify-center" type="submit">
                  Enter Management Console
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="pb-12">
      <section className="section-shell relative overflow-hidden pt-8 sm:pt-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-mesh-radial opacity-90" />

        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <span className="eyebrow bg-white/85 text-ink-700">
              <CalendarClock className="h-4 w-4" />
              Campaign, Goal, Event and Story Studio
            </span>
            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.04em] text-ink-900 sm:text-6xl sm:leading-[0.94] sm:tracking-[-0.05em]">
              Manage public campaigns, monthly goals, event moments, and testimonials from one hidden control room.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
              Add, track, and review landing-page campaigns, monthly goals, and featured events
              without exposing the management flow on the public website.
            </p>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="surface-panel bg-gradient-to-br from-white via-cream-50 to-forest-50 p-6 sm:p-10">
              <SectionHeading
                eyebrow="Campaign Form"
                title={
                  editingCampaign
                    ? 'Edit an existing campaign record.'
                    : 'Create or refine public landing-page campaigns.'
                }
                description={
                  editingCampaign
                    ? 'Update title, amounts, impact copy, featured state, or accent styling here.'
                    : 'These campaigns drive the featured cards on the public homepage, so this form controls what people see first.'
                }
              />

              <div className="mt-8">
                <CampaignForm
                  onCampaignSaved={handleCampaignSaved}
                  campaignToEdit={editingCampaign}
                  onCancelEdit={() => setEditingCampaign(null)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-panel overflow-hidden p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="eyebrow bg-forest-50 text-forest-700">
                      <Sparkles className="h-4 w-4" />
                      Campaign Overview
                    </span>
                    <h2 className="mt-5 font-display text-[2.1rem] font-semibold tracking-[-0.035em] text-ink-900 sm:text-4xl sm:tracking-[-0.04em]">
                      All saved campaigns at a glance
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-600">
                      Featured campaigns are eligible for the landing page, while the full list
                      below stays editable from this hidden console.
                    </p>
                  </div>
                  <Link href="/#campaigns" className="btn-outline">
                    View Public Campaigns
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[24px] bg-ink-900 px-5 py-4 text-cream-50">
                    <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">
                      Total campaigns
                    </p>
                    <p className="mt-3 font-display text-3xl font-semibold">{campaigns.length}</p>
                  </div>
                  <div className="rounded-[24px] bg-cream-50 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-clay-700">Featured</p>
                    <p className="mt-3 font-display text-3xl font-semibold text-ink-900">
                      {featuredCampaignCount}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-forest-50 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-forest-700">
                      Still collecting
                    </p>
                    <p className="mt-3 font-display text-3xl font-semibold text-ink-900">
                      {activeCampaignCount}
                    </p>
                  </div>
                </div>
              </div>

              {isLoading ? (
              <div className="surface-panel p-6 sm:p-8 text-sm text-ink-600">
                  Loading campaigns...
                </div>
              ) : campaigns.length > 0 ? (
                <div className="grid gap-6">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-white/85 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-600">
                            {campaign.featured ? 'Featured' : 'Standard'}
                          </span>
                          <span className="rounded-full bg-cream-100 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-clay-700">
                            {campaign.accent} accent
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            className="btn-outline px-4 py-2 text-xs uppercase tracking-[0.14em]"
                            type="button"
                            onClick={() => setEditingCampaign(campaign)}
                            disabled={campaignActionId === campaign.id}
                          >
                            Edit Campaign
                          </button>
                          <button
                            className="inline-flex items-center justify-center rounded-full bg-clay-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cream-50 transition hover:bg-clay-800 disabled:cursor-not-allowed disabled:opacity-60"
                            type="button"
                            onClick={() => void handleDeleteCampaign(campaign)}
                            disabled={campaignActionId === campaign.id}
                          >
                            {campaignActionId === campaign.id ? 'Deleting...' : 'Delete Campaign'}
                          </button>
                        </div>
                      </div>
                      <FeaturedCampaignCard campaign={campaign} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="surface-panel p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                    No campaigns yet
                  </p>
                  <h3 className="mt-4 font-display text-[2rem] font-semibold tracking-[-0.035em] text-ink-900 sm:text-3xl sm:tracking-[-0.04em]">
                    Add the first campaign and it will be ready for the landing page.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-ink-600">
                    Use the form to create featured campaigns, adjust their visual accent, and keep
                    the homepage focus area in sync with real fundraising work.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="surface-panel bg-gradient-to-br from-white via-cream-50 to-forest-50 p-6 sm:p-10">
              <SectionHeading
                eyebrow="Goal Form"
                title={editingGoal ? 'Edit an existing goal record.' : 'Input this month’s goal targets.'}
                description={
                  editingGoal
                    ? 'Update amounts, status, month, or purpose here, then save the changes back to Firebase.'
                    : 'The form defaults to the current month, but you can backfill earlier months too so the charts remain useful over time.'
                }
              />

              <div className="mt-8">
                <MonthlyGoalForm
                  onGoalSaved={handleGoalSaved}
                  goalToEdit={editingGoal}
                  onCancelEdit={() => setEditingGoal(null)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-panel overflow-hidden p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="eyebrow bg-forest-50 text-forest-700">
                      <Sparkles className="h-4 w-4" />
                      {getCurrentMonthLabel()}
                    </span>
                    <h2 className="mt-5 font-display text-[2.1rem] font-semibold tracking-[-0.035em] text-ink-900 sm:text-4xl sm:tracking-[-0.04em]">
                      Current month goals at a glance
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/statistics" className="btn-outline">
                      Open Statistics
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button className="btn-secondary" type="button" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[24px] bg-ink-900 px-5 py-4 text-cream-50">
                    <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">Target</p>
                    <p className="mt-3 font-display text-3xl font-semibold">
                      {formatCompactCurrency(currentMonthTarget)}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-forest-50 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-forest-700">
                      Collected
                    </p>
                    <p className="mt-3 font-display text-3xl font-semibold text-ink-900">
                      {formatCompactCurrency(currentMonthRaised)}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-clay-50 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-clay-700">Still left</p>
                    <p className="mt-3 font-display text-3xl font-semibold text-ink-900">
                      {formatCompactCurrency(currentMonthRemaining)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-ink-600">
                  <span>{currentMonthGoals.length} goals entered for this month</span>
                  <span>{completedCount} reached their full target</span>
                  <span>{Math.max(0, currentMonthGoals.length - completedCount)} still in progress</span>
                  <span>{goals.length} total saved goals available for editing</span>
                </div>
              </div>

              {isLoading ? (
                <div className="surface-panel p-6 sm:p-8 text-sm text-ink-600">
                  Loading saved goals...
                </div>
              ) : goals.length > 0 ? (
                <div className="grid gap-6">
                  {goals.map((goal) => (
                    <div key={goal.id} className="space-y-3">
                      <div className="flex flex-wrap justify-end gap-3">
                        <button
                          className="btn-outline px-4 py-2 text-xs uppercase tracking-[0.14em]"
                          type="button"
                          onClick={() => setEditingGoal(goal)}
                          disabled={goalActionId === goal.id}
                        >
                          Edit Goal
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-full bg-clay-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cream-50 transition hover:bg-clay-800 disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                          onClick={() => void handleDeleteGoal(goal)}
                          disabled={goalActionId === goal.id}
                        >
                          {goalActionId === goal.id ? 'Deleting...' : 'Delete Goal'}
                        </button>
                      </div>
                      <MonthlyGoalCard goal={goal} showMonthLabel />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="surface-panel p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                    No goals yet
                  </p>
                  <h3 className="mt-4 font-display text-[2rem] font-semibold tracking-[-0.035em] text-ink-900 sm:text-3xl sm:tracking-[-0.04em]">
                    Start with the first goal for {getCurrentMonthLabel()}.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-ink-600">
                    Once a goal is saved from this protected area, it can feed the monthly overview
                    and the statistics page.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="surface-panel bg-gradient-to-br from-white via-cream-50 to-clay-50 p-6 sm:p-10">
              <SectionHeading
                eyebrow="Event Form"
                title={
                  editingEvent
                    ? 'Edit an existing event record.'
                    : 'Add public events and mark the important ones as featured.'
                }
                description={
                  editingEvent
                    ? 'Change timing, category, status, or featured visibility here and save the updated event.'
                    : 'Every event saved here shows up in the admin list below, and featured events are prioritized in the public events section.'
                }
              />

              <div className="mt-8">
                <EventForm
                  onEventSaved={handleEventSaved}
                  eventToEdit={editingEvent}
                  onCancelEdit={() => setEditingEvent(null)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-panel overflow-hidden p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="eyebrow bg-cream-100 text-clay-700">
                      <Star className="h-4 w-4" />
                      Event Overview
                    </span>
                    <h2 className="mt-5 font-display text-[2.1rem] font-semibold tracking-[-0.035em] text-ink-900 sm:text-4xl sm:tracking-[-0.04em]">
                      All saved events in one place
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-600">
                      Featured events appear first, upcoming dates stay easy to scan, and the full
                      list below gives you one place to review what is already live.
                    </p>
                  </div>
                  <Link href="/#events" className="btn-outline">
                    View Public Events
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[24px] bg-ink-900 px-5 py-4 text-cream-50">
                    <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">
                      Total events
                    </p>
                    <p className="mt-3 font-display text-3xl font-semibold">{events.length}</p>
                  </div>
                  <div className="rounded-[24px] bg-cream-50 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-clay-700">
                      Featured
                    </p>
                    <p className="mt-3 font-display text-3xl font-semibold text-ink-900">
                      {featuredEventsCount}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-forest-50 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-forest-700">
                      Upcoming
                    </p>
                    <p className="mt-3 font-display text-3xl font-semibold text-ink-900">
                      {upcomingEventsCount}
                    </p>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="surface-panel p-6 sm:p-8 text-sm text-ink-600">Loading events...</div>
              ) : events.length > 0 ? (
                <div className="grid gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="space-y-3">
                      <div className="flex flex-wrap justify-end gap-3">
                        <button
                          className="btn-outline px-4 py-2 text-xs uppercase tracking-[0.14em]"
                          type="button"
                          onClick={() => setEditingEvent(event)}
                          disabled={eventActionId === event.id}
                        >
                          Edit Event
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-full bg-clay-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cream-50 transition hover:bg-clay-800 disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                          onClick={() => void handleDeleteEvent(event)}
                          disabled={eventActionId === event.id}
                        >
                          {eventActionId === event.id ? 'Deleting...' : 'Delete Event'}
                        </button>
                      </div>
                      <EventTimelineCard event={event} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="surface-panel p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                    No events yet
                  </p>
                  <h3 className="mt-4 font-display text-[2rem] font-semibold tracking-[-0.035em] text-ink-900 sm:text-3xl sm:tracking-[-0.04em]">
                    Add the first event and it will appear here immediately.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-ink-600">
                    Use the form to add upcoming activities, mark key events as featured, and keep
                    the public event section aligned with the real calendar.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="surface-panel bg-gradient-to-br from-white via-cream-50 to-forest-50 p-6 sm:p-10">
              <SectionHeading
                eyebrow="Testimonial Form"
                title={
                  editingTestimonial
                    ? 'Edit an existing testimonial record.'
                    : 'Create or refine public testimonials.'
                }
                description={
                  editingTestimonial
                    ? 'Update the quote, highlight, role, or featured state here.'
                    : 'These testimonials drive the public stories section, so this form controls what appears there.'
                }
              />

              <div className="mt-8">
                <TestimonialForm
                  onTestimonialSaved={handleTestimonialSaved}
                  testimonialToEdit={editingTestimonial}
                  onCancelEdit={() => setEditingTestimonial(null)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-panel overflow-hidden p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="eyebrow bg-cream-100 text-clay-700">
                      <Star className="h-4 w-4" />
                      Story Overview
                    </span>
                    <h2 className="mt-5 font-display text-[2.1rem] font-semibold tracking-[-0.035em] text-ink-900 sm:text-4xl sm:tracking-[-0.04em]">
                      All saved testimonials in one place
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-600">
                      Featured testimonials are eligible for the public stories section, while the
                      full list here stays editable from this hidden console.
                    </p>
                  </div>
                  <Link href="/#stories" className="btn-outline">
                    View Public Stories
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-ink-900 px-5 py-4 text-cream-50">
                    <p className="text-xs uppercase tracking-[0.18em] text-cream-100/60">
                      Total testimonials
                    </p>
                    <p className="mt-3 font-display text-3xl font-semibold">{testimonials.length}</p>
                  </div>
                  <div className="rounded-[24px] bg-cream-50 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-clay-700">Featured</p>
                    <p className="mt-3 font-display text-3xl font-semibold text-ink-900">
                      {featuredTestimonialsCount}
                    </p>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="surface-panel p-6 sm:p-8 text-sm text-ink-600">
                  Loading testimonials...
                </div>
              ) : testimonials.length > 0 ? (
                <div className="grid gap-6">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-white/85 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-600">
                            {testimonial.featured ? 'Featured' : 'Standard'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            className="btn-outline px-4 py-2 text-xs uppercase tracking-[0.14em]"
                            type="button"
                            onClick={() => setEditingTestimonial(testimonial)}
                            disabled={testimonialActionId === testimonial.id}
                          >
                            Edit Testimonial
                          </button>
                          <button
                            className="inline-flex items-center justify-center rounded-full bg-clay-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cream-50 transition hover:bg-clay-800 disabled:cursor-not-allowed disabled:opacity-60"
                            type="button"
                            onClick={() => void handleDeleteTestimonial(testimonial)}
                            disabled={testimonialActionId === testimonial.id}
                          >
                            {testimonialActionId === testimonial.id
                              ? 'Deleting...'
                              : 'Delete Testimonial'}
                          </button>
                        </div>
                      </div>
                      <TestimonialCard testimonial={testimonial} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="surface-panel p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                    No testimonials yet
                  </p>
                  <h3 className="mt-4 font-display text-[2rem] font-semibold tracking-[-0.035em] text-ink-900 sm:text-3xl sm:tracking-[-0.04em]">
                    Add the first testimonial and it will be ready for the public stories section.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-ink-600">
                    Use the form to manage featured quotes, supporter stories, and beneficiary
                    feedback from one place.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

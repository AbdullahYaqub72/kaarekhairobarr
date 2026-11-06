'use client'

import { ArrowRight, CalendarHeart, Crown, ShieldCheck, Users } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { Card, SectionTitle } from '@/components/ui/Card'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/AuthProvider'
import { TeamRow } from '@/features/teams/TeamRow'
import { useApi } from '@/hooks/useApi'
import { firstName } from '@/lib/format'
import type { AdminOverview, TeamSummary } from '@/types/models'

export function HomeScreen() {
  const { me, isAdmin } = useAuth()
  const profile = me?.profile
  const teams = useApi<{ teams: TeamSummary[] }>('/api/teams')
  if (!profile) return null

  const myTeams = teams.data?.teams.filter((team) => team.myPosition) ?? []
  const leading = myTeams.filter((team) => team.myPosition === 'lead' || team.myPosition === 'co-lead')

  return (
    <>
      {/* Greeting band continues the navy top bar */}
      <section className="rounded-b-[24px] bg-navy px-4 pb-8 pt-4 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Assalam o Alaikum</p>
        <h1 className="mt-1 text-[26px] text-white">{firstName(profile.fullName)}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {isAdmin && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-navy-deep">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Admin
            </span>
          )}
          {leading.map((team) => (
            <span
              key={team.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white"
            >
              <Crown className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              {team.myPosition === 'lead' ? 'Lead' : 'Co-lead'} · {team.name}
            </span>
          ))}
        </div>
      </section>

      <div className="space-y-5 px-4 pt-5">
        {isAdmin && <AdminAttention />}

        <section aria-labelledby="my-teams">
          <SectionTitle
            eyebrow="Your teams"
            title={myTeams.length > 1 ? `You're in ${myTeams.length} teams` : 'Your team'}
            action={
              <Link href="/teams" className="inline-flex min-h-[44px] items-center gap-1 text-[15px] font-bold text-navy-light">
                All teams <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
          {teams.loading ? (
            <Card padded={false} className="space-y-3 p-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </Card>
          ) : teams.error ? (
            <ErrorState message={teams.error} onRetry={teams.reload} />
          ) : myTeams.length === 0 ? (
            <EmptyState icon={Users} title="No team yet">
              An admin will add you to a team. Until then, you can see all teams on the Teams tab.
            </EmptyState>
          ) : (
            <Card padded={false} as="section" className="divide-y divide-line overflow-hidden">
              {myTeams.map((team) => (
                <TeamRow key={team.id} team={team} href={`/teams/${team.id}`} />
              ))}
            </Card>
          )}
        </section>

        {leading.length > 0 && (
          <Callout tone="info" title={`You lead ${leading.map((t) => t.name).join(' and ')}`}>
            You can see your team&apos;s contact details on the team page. Tools for creating tasks and events
            for your team are coming next.
          </Callout>
        )}

        <Card className="flex items-start gap-4 bg-panel shadow-none ring-1 ring-line">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
            <CalendarHeart className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold text-navy">Coming soon: tasks &amp; events</p>
            <p className="mt-1 text-[15px] text-muted">
              Events, donation drives and team tasks will show up here, ready for you to volunteer.
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}

function AdminAttention() {
  const { data, loading } = useApi<AdminOverview>('/api/admin/overview')
  if (loading || !data) return null
  const items = [
    { count: data.pendingMembers, label: 'waiting for approval', href: '/admin/members' },
    { count: data.pendingLeaveRequests, label: 'leave requests', href: '/admin/leave-requests' },
  ].filter((item) => item.count > 0)

  if (items.length === 0) return null

  return (
    <Card className="border-l-4 border-gold">
      <SectionTitle eyebrow="Admin" title="Needs your attention" />
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex min-h-[48px] items-center justify-between gap-3 rounded-control bg-panel px-4 py-2 transition hover:bg-navy-50"
            >
              <span className="text-[15px] text-ink">
                <Badge tone="warning" className="mr-2">
                  {item.count}
                </Badge>
                {item.label}
              </span>
              <ArrowRight className="h-4 w-4 text-navy" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <ButtonLink href="/admin" variant="ghost" block className="mt-2">
        Open admin
      </ButtonLink>
    </Card>
  )
}

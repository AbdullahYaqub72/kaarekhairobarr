'use client'

import clsx from 'clsx'
import { ArrowRight, Crown, DoorOpen, Ticket, UserCheck, Users, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/layout/AdminShell'
import { ButtonLink } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { ErrorState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/AuthProvider'
import { useApi } from '@/hooks/useApi'
import { firstName } from '@/lib/format'
import type { AdminOverview } from '@/types/models'

export function AdminOverviewScreen() {
  const { me } = useAuth()
  const { data, error, loading, reload } = useApi<AdminOverview>('/api/admin/overview')

  return (
    <>
      <AdminPageHeader
        title={`Welcome, ${firstName(me?.profile?.fullName ?? '')}`}
        description="Approve new members, hand out invite codes and keep every team led."
        action={
          <ButtonLink href="/admin/invites?new=1" className="sm:w-auto" block>
            <Ticket className="h-5 w-5" aria-hidden="true" /> New invite code
          </ButtonLink>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              icon={UserCheck}
              label="Waiting for approval"
              value={data?.pendingMembers}
              href="/admin/members"
              urgent={Boolean(data?.pendingMembers)}
            />
            <Stat
              icon={DoorOpen}
              label="Leave requests"
              value={data?.pendingLeaveRequests}
              href="/admin/leave-requests"
              urgent={Boolean(data?.pendingLeaveRequests)}
            />
            <Stat icon={Users} label="Active members" value={data?.activeMembers} href="/admin/members?tab=active" />
            <Stat icon={Ticket} label="Unused invite codes" value={data?.activeInvites} href="/admin/invites" />
          </div>

          {loading ? null : data && data.vacantLeadTeams.length > 0 ? (
            <Callout tone="warning" title="Teams without a lead">
              {data.vacantLeadTeams.join(', ')} {data.vacantLeadTeams.length === 1 ? 'has' : 'have'} no lead.{' '}
              <Link href="/admin/teams" className="font-bold text-navy-light underline-offset-4 hover:underline">
                Appoint one
              </Link>
            </Callout>
          ) : data ? (
            <Callout tone="success" title="Every team has a lead">
              <span className="inline-flex items-center gap-1">
                <Crown className="h-4 w-4 text-gold-dark" aria-hidden="true" /> Nice.
              </span>
            </Callout>
          ) : null}
        </div>
      )}
    </>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  href,
  urgent = false,
}: {
  icon: LucideIcon
  label: string
  value: number | undefined
  href: string
  urgent?: boolean
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'group flex flex-col justify-between gap-4 rounded-card bg-surface p-4 shadow-card transition hover:-translate-y-0.5 sm:p-5',
        urgent && 'ring-2 ring-gold'
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            'inline-flex h-10 w-10 items-center justify-center rounded-full',
            urgent ? 'bg-gold text-navy-deep' : 'bg-navy-50 text-navy'
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <div>
        {value === undefined ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <p className="text-[30px] font-bold leading-none text-navy">{value}</p>
        )}
        <p className="mt-1.5 text-sm font-bold text-muted">{label}</p>
      </div>
    </Link>
  )
}

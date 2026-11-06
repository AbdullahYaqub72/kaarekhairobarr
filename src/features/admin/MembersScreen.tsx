'use client'

import { ChevronRight, Search, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AdminPageHeader } from '@/components/layout/AdminShell'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { LoadingBlock } from '@/components/ui/Spinner'
import { useApi } from '@/hooks/useApi'
import { formatDate, POSITION_META, STATUS_META, timeAgo } from '@/lib/format'
import type { UserProfile, UserStatus } from '@/types/models'
import { useAdminTeams } from './useAdminTeams'

type Tab = 'pending' | 'active' | 'suspended' | 'signing' | 'past'

const TABS: { value: Tab; label: string; statuses: UserStatus[] }[] = [
  { value: 'pending', label: 'Waiting for approval', statuses: ['pending_approval'] },
  { value: 'active', label: 'Active', statuses: ['active'] },
  { value: 'suspended', label: 'Suspended', statuses: ['suspended'] },
  { value: 'signing', label: 'Not signed yet', statuses: ['registered'] },
  { value: 'past', label: 'Past', statuses: ['alumni', 'rejected'] },
]

export function MembersScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = (TABS.find((t) => t.value === searchParams.get('tab'))?.value ?? 'pending') as Tab
  const [query, setQuery] = useState('')
  const { data, error, loading, reload } = useApi<{ members: UserProfile[] }>('/api/admin/members')
  const { nameOf } = useAdminTeams()

  const members = useMemo(() => data?.members ?? [], [data])
  const statuses = TABS.find((t) => t.value === tab)!.statuses
  const q = query.trim().toLowerCase()
  const visible = members
    .filter((m) => statuses.includes(m.status))
    .filter((m) => !q || m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))

  const setTab = (value: Tab) => router.replace(`/admin/members?tab=${value}`, { scroll: false })

  return (
    <>
      <AdminPageHeader title="Members" description="Review people who joined, and manage everyone's status and teams." />

      <div className="mb-5 space-y-4">
        <Segmented
          label="Member status"
          value={tab}
          onChange={setTab}
          options={TABS.map((t) => ({
            value: t.value,
            label: t.label,
            count: members.filter((m) => t.statuses.includes(m.status)).length,
          }))}
        />
        <label className="relative block max-w-md">
          <span className="sr-only">Search members</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
            className="block min-h-[48px] w-full rounded-control border border-line bg-surface pl-12 text-ink placeholder:text-muted/70 pr-4 text-base focus:border-navy-light focus:outline-none focus:ring-2 focus:ring-navy-light/20"
          />
        </label>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState icon={UserCheck} title={q ? 'No one matches that search' : 'Nobody here'}>
          {tab === 'pending' && !q ? 'New members show up here after they sign the agreement.' : undefined}
        </EmptyState>
      ) : (
        <>
          {/* Phones: stacked cards */}
          <ul className="space-y-3 md:hidden">
            {visible.map((member) => (
              <li key={member.uid}>
                <Link
                  href={`/admin/members/${member.uid}`}
                  className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-card"
                >
                  <Avatar name={member.fullName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-navy">{member.fullName}</p>
                    <p className="truncate text-sm text-muted">{member.email}</p>
                    <p className="mt-1 text-sm text-muted">{timeAgo(member.updatedAt || member.createdAt)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablet / laptop: table */}
          <Card padded={false} className="hidden overflow-hidden md:block">
            <table className="w-full text-left text-[15px]">
              <thead className="border-b border-line bg-panel text-xs uppercase tracking-[0.12em] text-navy">
                <tr>
                  <th className="px-5 py-3 font-bold">Member</th>
                  <th className="px-5 py-3 font-bold">Teams</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Joined</th>
                  <th className="px-5 py-3" aria-label="Open" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((member) => (
                  <tr
                    key={member.uid}
                    className="cursor-pointer transition hover:bg-panel"
                    onClick={() => router.push(`/admin/members/${member.uid}`)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.fullName} size="sm" />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/members/${member.uid}`}
                            className="block truncate font-bold text-navy hover:underline"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {member.fullName}
                          </Link>
                          <p className="truncate text-sm text-muted">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <TeamBadges member={member} nameOf={nameOf} />
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_META[member.status].tone}>{STATUS_META[member.status].label}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(member.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <ChevronRight className="ml-auto h-5 w-5 text-muted" aria-hidden="true" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </>
  )
}

function TeamBadges({ member, nameOf }: { member: UserProfile; nameOf: (id: string) => string }) {
  const entries = Object.entries(member.teams)
  if (entries.length === 0) {
    return member.requestedTeams.length ? (
      <span className="text-sm text-muted">Asked for: {member.requestedTeams.map(nameOf).join(', ')}</span>
    ) : (
      <span className="text-sm text-muted">-</span>
    )
  }
  return (
    <span className="flex flex-wrap gap-1.5">
      {entries.map(([teamId, position]) => (
        <Badge key={teamId} tone={POSITION_META[position].tone}>
          {nameOf(teamId)}
          {position !== 'member' ? ` · ${POSITION_META[position].label}` : ''}
        </Badge>
      ))}
    </span>
  )
}

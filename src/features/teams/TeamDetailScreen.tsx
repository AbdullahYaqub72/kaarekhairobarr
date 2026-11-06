'use client'

import { Crown, Mail, MessageCircle, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card, SectionTitle } from '@/components/ui/Card'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { LoadingBlock } from '@/components/ui/Spinner'
import { useApi } from '@/hooks/useApi'
import { POSITION_META, whatsappLink } from '@/lib/format'
import type { RosterMember, TeamDetailResponse } from '@/types/models'

export function TeamDetailScreen({ teamId }: { teamId: string }) {
  const { data, error, loading, reload } = useApi<TeamDetailResponse>(`/api/teams/${encodeURIComponent(teamId)}`)

  if (loading) return <LoadingBlock />
  if (error || !data) {
    return (
      <div className="px-4 pt-6">
        <ErrorState message={error ?? 'Team not found.'} onRetry={reload} />
      </div>
    )
  }

  const { team, roster, canSeeContacts } = data
  const leaders = roster.filter((m) => m.position !== 'member')
  const members = roster.filter((m) => m.position === 'member')

  return (
    <>
      <PageHeader backHref="/teams" backLabel="Teams" eyebrow="Team" title={team.name} subtitle={team.description} />

      <div className="space-y-6 px-4">
        <section>
          <SectionTitle eyebrow="Leadership" title="Who runs this team" />
          {leaders.length === 0 ? (
            <EmptyState icon={Crown} title="No lead appointed yet">
              An admin will appoint a lead and co-lead for {team.name}.
            </EmptyState>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {leaders.map((member) => (
                <Card key={member.uid} className="flex items-center gap-4">
                  <Avatar name={member.fullName} size="lg" highlight={member.position === 'lead'} />
                  <div className="min-w-0">
                    <Badge tone={POSITION_META[member.position].tone}>{POSITION_META[member.position].label}</Badge>
                    <p className="mt-1 truncate font-bold text-navy">{member.fullName}</p>
                    {canSeeContacts && <ContactLinks member={member} />}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionTitle eyebrow="Members" title={`${members.length} ${members.length === 1 ? 'member' : 'members'}`} />
          {members.length === 0 ? (
            <EmptyState icon={Users} title="No members yet" />
          ) : (
            <Card padded={false} as="section" className="divide-y divide-line overflow-hidden">
              {members.map((member) => (
                <div key={member.uid} className="flex min-h-[64px] items-center gap-3 px-4 py-3">
                  <Avatar name={member.fullName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink">{member.fullName}</p>
                    {canSeeContacts && member.phone && <p className="text-sm text-muted">{member.phone}</p>}
                  </div>
                  {canSeeContacts && <ContactLinks member={member} compact />}
                </div>
              ))}
            </Card>
          )}
          {!canSeeContacts && (
            <p className="mt-3 text-sm text-muted">Contact details are visible to the team&apos;s lead and co-lead.</p>
          )}
        </section>
      </div>
    </>
  )
}

function ContactLinks({ member, compact = false }: { member: RosterMember; compact?: boolean }) {
  const linkClass =
    'inline-flex h-11 w-11 items-center justify-center rounded-full text-navy transition hover:bg-navy-50'
  return (
    <div className={compact ? 'flex shrink-0' : '-ml-2.5 mt-1 flex'}>
      {member.phone && (
        <a
          href={whatsappLink(member.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          aria-label={`WhatsApp ${member.fullName}`}
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </a>
      )}
      {member.email && (
        <a href={`mailto:${member.email}`} className={linkClass} aria-label={`Email ${member.fullName}`}>
          <Mail className="h-5 w-5" aria-hidden="true" />
        </a>
      )}
    </div>
  )
}

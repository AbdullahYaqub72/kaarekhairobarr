'use client'

import { ArrowLeft, Ban, Check, MessageCircle, RotateCcw, UserMinus, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ReasonDialog } from '@/components/shared/ReasonDialog'
import { TeamPicker } from '@/components/shared/TeamPicker'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { Card, DetailList, SectionTitle } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { LoadingBlock } from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/AuthProvider'
import { useApi } from '@/hooks/useApi'
import { api } from '@/lib/api/client'
import {
  errorMessage,
  formatDate,
  formatDateTime,
  LEAVE_META,
  POSITION_META,
  STATUS_META,
  whatsappLink,
} from '@/lib/format'
import type { AdminMemberDetail, UserProfile } from '@/types/models'
import { useAdminTeams } from './useAdminTeams'

type ReasonAction = 'reject' | 'suspend' | 'remove'

const REASON_COPY: Record<ReasonAction, { title: string; description: string; confirm: string }> = {
  reject: {
    title: 'Reject this request?',
    description: 'They will see your reason and need a new invite code to try again.',
    confirm: 'Reject',
  },
  suspend: {
    title: 'Suspend this member?',
    description: 'They lose access until you restore them. Their teams and positions are kept.',
    confirm: 'Suspend',
  },
  remove: {
    title: 'Remove from KKB?',
    description: 'They become alumni and are taken off all teams. Any lead positions become vacant.',
    confirm: 'Remove',
  },
}

export function MemberDetailScreen({ uid }: { uid: string }) {
  const { me } = useAuth()
  const { data, error, loading, reload } = useApi<AdminMemberDetail>(`/api/admin/members/${encodeURIComponent(uid)}`)
  const teams = useAdminTeams()
  const [reasonAction, setReasonAction] = useState<ReasonAction | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading && !data) return <LoadingBlock />
  if (error || !data) return <ErrorState message={error ?? 'Member not found.'} onRetry={reload} />

  const { profile, signature, leaveRequests } = data
  const status = STATUS_META[profile.status]
  const isSelf = profile.uid === me?.profile?.uid
  const isOtherAdmin = profile.orgRole === 'admin' && !isSelf

  const act = async (body: Record<string, unknown>, success: string) => {
    setBusy(true)
    try {
      await api(`/api/admin/members/${encodeURIComponent(uid)}`, { body })
      toast.success(success)
      setReasonAction(null)
      await Promise.all([reload(), teams.reload()])
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Link
        href="/admin/members"
        className="-ml-2 mb-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-control px-2 font-bold text-navy-light"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Members
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {/* Identity */}
          <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar name={profile.fullName} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[22px] text-navy">{profile.fullName}</h1>
              <p className="truncate text-[15px] text-muted">{profile.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={status.tone}>{status.label}</Badge>
                {profile.orgRole === 'admin' && <Badge tone="gold">Admin</Badge>}
              </div>
            </div>
            {profile.phone && (
              <ButtonLink href={whatsappLink(profile.phone)} external variant="whatsapp" className="sm:w-auto" block>
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> WhatsApp
              </ButtonLink>
            )}
          </Card>

          {profile.statusReason && (
            <Callout tone={profile.status === 'active' ? 'info' : 'warning'} title="Status note">
              {profile.statusReason}
            </Callout>
          )}

          <section>
            <SectionTitle eyebrow="Profile" title="Details" />
            <DetailList
              items={[
                { label: 'WhatsApp', value: profile.phone || '-' },
                { label: 'Department', value: profile.department || '-' },
                { label: 'Batch', value: profile.batch || '-' },
                { label: 'Skills', value: profile.skills.join(', ') || '-' },
                {
                  label: 'Asked to join',
                  value: profile.requestedTeams.map(teams.nameOf).join(', ') || '-',
                },
                { label: 'Joined', value: formatDate(profile.createdAt) },
                { label: 'Approved', value: formatDate(profile.approvedAt) },
              ]}
            />
          </section>

          <section>
            <SectionTitle eyebrow="Agreement" title="Member agreement" />
            {signature ? (
              <DetailList
                items={[
                  { label: 'Version', value: `Version ${signature.version}` },
                  { label: 'Signed as', value: <span className="font-semibold">{signature.typedName}</span> },
                  { label: 'Signed on', value: formatDateTime(signature.signedAt) },
                  { label: 'Device', value: <span className="text-sm text-muted">{signature.userAgent || '-'}</span> },
                ]}
              />
            ) : (
              <Callout tone="warning">Hasn&apos;t signed the member agreement yet.</Callout>
            )}
          </section>

          {leaveRequests.length > 0 && (
            <section>
              <SectionTitle eyebrow="History" title="Leave requests" />
              <Card padded={false} className="divide-y divide-line">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="space-y-1 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted">{formatDate(request.createdAt)}</span>
                      <Badge tone={LEAVE_META[request.status].tone}>{LEAVE_META[request.status].label}</Badge>
                    </div>
                    <p className="text-[15px] text-ink">{request.reason || <em className="text-muted">No reason given</em>}</p>
                    {request.reviewNote && (
                      <p className="text-sm text-muted">
                        {request.reviewedByName}: {request.reviewNote}
                      </p>
                    )}
                  </div>
                ))}
              </Card>
            </section>
          )}
        </div>

        {/* Actions column */}
        <div className="space-y-6">
          {profile.status === 'pending_approval' && (
            <ApprovePanel
              profile={profile}
              teams={teams.activeTeams}
              busy={busy}
              onApprove={(teamIds) => act({ action: 'approve', teams: teamIds }, `${profile.fullName} is now a member.`)}
              onReject={() => setReasonAction('reject')}
            />
          )}

          {profile.status === 'registered' && !isOtherAdmin && (
            <Card className="space-y-4">
              <SectionTitle eyebrow="Joining" title="Hasn't signed yet" />
              <p className="text-[15px] text-ink-soft">
                They used an invite code but haven&apos;t signed the agreement. They&apos;ll appear under
                &ldquo;Waiting for approval&rdquo; once they do.
              </p>
              <Button variant="danger" block onClick={() => setReasonAction('reject')}>
                <X className="h-5 w-5" aria-hidden="true" /> Reject
              </Button>
            </Card>
          )}

          {(profile.status === 'active' || profile.status === 'suspended') && (
            <TeamsPanel
              key={JSON.stringify(profile.teams)}
              profile={profile}
              teams={teams.activeTeams}
              busy={busy}
              onSave={(teamIds) => act({ action: 'setTeams', teams: teamIds }, 'Teams updated.')}
            />
          )}

          {!isSelf && !isOtherAdmin && (profile.status === 'active' || profile.status === 'suspended') && (
            <Card className="space-y-3">
              <SectionTitle eyebrow="Status" title="Membership" />
              {profile.status === 'active' ? (
                <Button variant="secondary" block onClick={() => setReasonAction('suspend')}>
                  <Ban className="h-5 w-5" aria-hidden="true" /> Suspend
                </Button>
              ) : (
                <Button block loading={busy} onClick={() => act({ action: 'restore' }, 'Access restored.')}>
                  <RotateCcw className="h-5 w-5" aria-hidden="true" /> Restore access
                </Button>
              )}
              <Button variant="danger" block onClick={() => setReasonAction('remove')}>
                <UserMinus className="h-5 w-5" aria-hidden="true" /> Remove from KKB
              </Button>
            </Card>
          )}
        </div>
      </div>

      {reasonAction && (
        <ReasonDialog
          open
          onClose={() => setReasonAction(null)}
          busy={busy}
          tone="danger"
          title={REASON_COPY[reasonAction].title}
          description={REASON_COPY[reasonAction].description}
          confirmLabel={REASON_COPY[reasonAction].confirm}
          onConfirm={(reason) =>
            act({ action: reasonAction, reason }, `${REASON_COPY[reasonAction].confirm}: done.`)
          }
        />
      )}
    </>
  )
}

function ApprovePanel({
  profile,
  teams,
  busy,
  onApprove,
  onReject,
}: {
  profile: UserProfile
  teams: { id: string; name: string; description: string }[]
  busy: boolean
  onApprove: (teamIds: string[]) => void
  onReject: () => void
}) {
  const [selected, setSelected] = useState<string[]>(profile.requestedTeams)
  return (
    <Card className="space-y-4 ring-2 ring-gold">
      <SectionTitle eyebrow="Waiting for you" title="Approve this member" />
      <TeamPicker
        label="Add to teams"
        hint="Pre-filled with the teams they asked for."
        teams={teams}
        value={selected}
        onChange={setSelected}
      />
      <Button block loading={busy} onClick={() => onApprove(selected)}>
        <Check className="h-5 w-5" aria-hidden="true" /> Approve
      </Button>
      <Button variant="danger" block disabled={busy} onClick={onReject}>
        <X className="h-5 w-5" aria-hidden="true" /> Reject
      </Button>
    </Card>
  )
}

function TeamsPanel({
  profile,
  teams,
  busy,
  onSave,
}: {
  profile: UserProfile
  teams: { id: string; name: string; description: string }[]
  busy: boolean
  onSave: (teamIds: string[]) => void
}) {
  const current = Object.keys(profile.teams)
  const [selected, setSelected] = useState<string[]>(current)
  const changed = selected.length !== current.length || selected.some((id) => !current.includes(id))
  const losingLead = current.filter(
    (id) => !selected.includes(id) && profile.teams[id] && profile.teams[id] !== 'member'
  )

  return (
    <Card className="space-y-4">
      <SectionTitle eyebrow="Teams" title="Team membership" />
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(profile.teams).map(([id, position]) =>
          position !== 'member' ? (
            <Badge key={id} tone={POSITION_META[position].tone}>
              {POSITION_META[position].label} · {teams.find((t) => t.id === id)?.name ?? id}
            </Badge>
          ) : null
        )}
      </div>
      <TeamPicker label="Member of" teams={teams} value={selected} onChange={setSelected} />
      {losingLead.length > 0 && (
        <Callout tone="warning">Removing them from a team they lead leaves that team without a leader.</Callout>
      )}
      <p className="text-sm text-muted">Appoint leads and co-leads from the Teams page.</p>
      <Button block disabled={!changed} loading={busy} onClick={() => onSave(selected)}>
        Save teams
      </Button>
    </Card>
  )
}

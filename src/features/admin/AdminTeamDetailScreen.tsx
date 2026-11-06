'use client'

import { Archive, ArchiveRestore, ArrowLeft, Crown, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { Card, SectionTitle } from '@/components/ui/Card'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { LoadingBlock } from '@/components/ui/Spinner'
import { useApi } from '@/hooks/useApi'
import { api } from '@/lib/api/client'
import { comparePositions, errorMessage, POSITION_META } from '@/lib/format'
import type { TeamSummary, UserProfile } from '@/types/models'
import { useAdminTeams } from './useAdminTeams'

export function AdminTeamDetailScreen({ teamId }: { teamId: string }) {
  const teams = useAdminTeams()
  const members = useApi<{ members: UserProfile[] }>('/api/admin/members')
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  const team = teams.teams.find((t) => t.id === teamId)
  const active = useMemo(
    () => (members.data?.members ?? []).filter((m) => m.status === 'active'),
    [members.data]
  )
  const roster = active
    .filter((m) => m.teams[teamId])
    .sort((a, b) => comparePositions(a.teams[teamId]!, b.teams[teamId]!) || a.fullName.localeCompare(b.fullName))

  if (teams.loading || members.loading) return <LoadingBlock />
  if (teams.error || members.error) {
    return <ErrorState message={teams.error ?? members.error ?? ''} onRetry={() => void teams.reload()} />
  }
  if (!team) return <ErrorState message="Team not found." />

  const reloadAll = () => Promise.all([teams.reload(), members.reload()])

  const setLeader = async (position: 'lead' | 'co-lead', uid: string | null) => {
    setBusy(true)
    try {
      await api(`/api/admin/teams/${teamId}`, { body: { position, uid } })
      toast.success(uid ? `${POSITION_META[position].label} appointed.` : `${POSITION_META[position].label} cleared.`)
      await reloadAll()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const toggleArchive = async () => {
    if (team.active && !window.confirm(`Archive ${team.name}? Members won't see it any more.`)) return
    setBusy(true)
    try {
      await api(`/api/admin/teams/${teamId}`, { method: 'PATCH', body: { active: !team.active } })
      toast.success(team.active ? 'Team archived.' : 'Team restored.')
      await reloadAll()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Link
        href="/admin/teams"
        className="-ml-2 mb-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-control px-2 font-bold text-navy-light"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Teams
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl text-navy">{team.name}</h1>
            {!team.active && <Badge>Archived</Badge>}
          </div>
          <p className="mt-1 max-w-2xl text-[15px] text-muted">{team.description || 'No description yet.'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)} className="flex-1 sm:flex-none">
            <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
          </Button>
          <Button variant="secondary" onClick={toggleArchive} loading={busy} className="flex-1 sm:flex-none">
            {team.active ? (
              <>
                <Archive className="h-4 w-4" aria-hidden="true" /> Archive
              </>
            ) : (
              <>
                <ArchiveRestore className="h-4 w-4" aria-hidden="true" /> Restore
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section>
          <SectionTitle eyebrow="Leadership" title="Lead & co-lead" />
          {team.active ? (
            <Card className="space-y-5">
              <LeaderPicker
                key={`lead-${team.leadUid}`}
                label="Lead"
                currentUid={team.leadUid}
                otherUid={team.coLeadUid}
                candidates={active}
                teamId={teamId}
                busy={busy}
                onSave={(uid) => setLeader('lead', uid)}
              />
              <LeaderPicker
                key={`co-${team.coLeadUid}`}
                label="Co-lead"
                currentUid={team.coLeadUid}
                otherUid={team.leadUid}
                candidates={active}
                teamId={teamId}
                busy={busy}
                onSave={(uid) => setLeader('co-lead', uid)}
              />
              <p className="text-sm text-muted">
                Appointing someone adds them to the team. The previous holder stays as a regular member.
              </p>
            </Card>
          ) : (
            <Callout tone="info">Restore the team to appoint leaders.</Callout>
          )}
        </section>

        <section>
          <SectionTitle eyebrow="Roster" title={`${roster.length} ${roster.length === 1 ? 'member' : 'members'}`} />
          {roster.length === 0 ? (
            <EmptyState icon={Crown} title="No members yet">
              Add people to this team from their member page.
            </EmptyState>
          ) : (
            <Card padded={false} className="divide-y divide-line overflow-hidden">
              {roster.map((member) => {
                const position = member.teams[teamId]!
                return (
                  <Link
                    key={member.uid}
                    href={`/admin/members/${member.uid}`}
                    className="flex min-h-[64px] items-center gap-3 px-4 py-3 transition hover:bg-panel"
                  >
                    <Avatar name={member.fullName} size="sm" highlight={position === 'lead'} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-navy">{member.fullName}</p>
                      <p className="truncate text-sm text-muted">{member.phone || member.email}</p>
                    </div>
                    <Badge tone={POSITION_META[position].tone}>{POSITION_META[position].label}</Badge>
                  </Link>
                )
              })}
            </Card>
          )}
        </section>
      </div>

      <EditTeamModal
        open={editing}
        team={team}
        onClose={() => setEditing(false)}
        onSaved={() => {
          setEditing(false)
          void teams.reload()
        }}
      />
    </>
  )
}

function LeaderPicker({
  label,
  currentUid,
  otherUid,
  candidates,
  teamId,
  busy,
  onSave,
}: {
  label: string
  currentUid: string | null
  otherUid: string | null
  candidates: UserProfile[]
  teamId: string
  busy: boolean
  onSave: (uid: string | null) => void
}) {
  const [value, setValue] = useState(currentUid ?? '')
  const inTeam = candidates.filter((m) => m.teams[teamId])
  const others = candidates.filter((m) => !m.teams[teamId])
  const changed = value !== (currentUid ?? '')

  return (
    <div className="space-y-2">
      <SelectField label={label} value={value} onChange={(event) => setValue(event.target.value)}>
        <option value="">- Vacant -</option>
        {inTeam.length > 0 && (
          <optgroup label="In this team">
            {inTeam.map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.fullName}
                {m.uid === otherUid ? ` (currently ${label === 'Lead' ? 'co-lead' : 'lead'})` : ''}
              </option>
            ))}
          </optgroup>
        )}
        {others.length > 0 && (
          <optgroup label="Other active members">
            {others.map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.fullName}
              </option>
            ))}
          </optgroup>
        )}
      </SelectField>
      {changed && (
        <Button block size="md" loading={busy} onClick={() => onSave(value || null)}>
          {value ? `Appoint as ${label.toLowerCase()}` : `Clear ${label.toLowerCase()}`}
        </Button>
      )}
    </div>
  )
}

function EditTeamModal({
  open,
  team,
  onClose,
  onSaved,
}: {
  open: boolean
  team: TeamSummary
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description)
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    try {
      await api(`/api/admin/teams/${team.id}`, { method: 'PATCH', body: { name, description } })
      toast.success('Team updated.')
      onSaved()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit ${team.name}`}
      footer={
        <>
          <Button variant="secondary" block className="sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button block className="sm:w-auto" onClick={save} loading={busy}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField label="Team name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
        <TextAreaField
          label="Description"
          optional
          value={description}
          maxLength={160}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </Modal>
  )
}

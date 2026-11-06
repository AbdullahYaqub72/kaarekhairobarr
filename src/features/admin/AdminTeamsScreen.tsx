'use client'

import clsx from 'clsx'
import { ChevronRight, Crown, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { AdminPageHeader } from '@/components/layout/AdminShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { TextAreaField, TextField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { LoadingBlock } from '@/components/ui/Spinner'
import { api } from '@/lib/api/client'
import { errorMessage } from '@/lib/format'
import type { TeamSummary } from '@/types/models'
import { useAdminTeams } from './useAdminTeams'

export function AdminTeamsScreen() {
  const { teams, error, loading, reload } = useAdminTeams()
  const [creating, setCreating] = useState(false)

  return (
    <>
      <AdminPageHeader
        title="Teams"
        description="Every team needs a lead; a co-lead is recommended. Add new teams as KKB grows."
        action={
          <Button onClick={() => setCreating(true)} block className="sm:w-auto">
            <Plus className="h-5 w-5" aria-hidden="true" /> New team
          </Button>
        }
      />

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : teams.length === 0 ? (
        <EmptyState icon={Users} title="No teams yet">
          Run the bootstrap script to create the starting teams, or add one here.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <li key={team.id}>
              <TeamCard team={team} />
            </li>
          ))}
        </ul>
      )}

      <CreateTeamModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={() => {
          setCreating(false)
          void reload()
        }}
      />
    </>
  )
}

function TeamCard({ team }: { team: TeamSummary }) {
  return (
    <Link
      href={`/admin/teams/${team.id}`}
      className={clsx(
        'flex h-full flex-col gap-4 rounded-card bg-surface p-5 shadow-card transition hover:-translate-y-0.5',
        !team.active && 'opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold text-navy">{team.name}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted">{team.description || 'No description'}</p>
        </div>
        {!team.active ? (
          <Badge>Archived</Badge>
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
        )}
      </div>
      <dl className="mt-auto grid grid-cols-3 gap-2 rounded-control bg-panel p-3 text-sm">
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.1em] text-navy">Lead</dt>
          <dd className={clsx('mt-0.5 truncate', team.leadName ? 'text-ink' : 'font-bold text-warning')}>
            {team.leadName ? (
              <span className="inline-flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 shrink-0 text-gold-dark" aria-hidden="true" />
                <span className="truncate">{team.leadName}</span>
              </span>
            ) : (
              'Vacant'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.1em] text-navy">Co-lead</dt>
          <dd className="mt-0.5 truncate text-ink">{team.coLeadName ?? <span className="text-muted">-</span>}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.1em] text-navy">Members</dt>
          <dd className="mt-0.5 text-ink">{team.memberCount}</dd>
        </div>
      </dl>
    </Link>
  )
}

function CreateTeamModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)

  const create = async () => {
    setBusy(true)
    try {
      await api('/api/admin/teams', { body: { name, description } })
      toast.success(`${name} team created.`)
      setName('')
      setDescription('')
      onCreated()
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
      title="New team"
      footer={
        <>
          <Button variant="secondary" block className="sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button block className="sm:w-auto" onClick={create} loading={busy}>
            Create team
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField label="Team name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
        <TextAreaField
          label="What does this team do?"
          optional
          value={description}
          maxLength={160}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </Modal>
  )
}

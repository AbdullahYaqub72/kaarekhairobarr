'use client'

import { Copy, MessageCircle, Plus, Ticket, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminPageHeader } from '@/components/layout/AdminShell'
import { TeamPicker } from '@/components/shared/TeamPicker'
import { Badge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { SelectField, TextField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Segmented } from '@/components/ui/Segmented'
import { LoadingBlock } from '@/components/ui/Spinner'
import { BRAND_NAME } from '@/config/brand'
import { useApi } from '@/hooks/useApi'
import { api } from '@/lib/api/client'
import { errorMessage, formatDate, INVITE_META } from '@/lib/format'
import { formatInviteCode } from '@/lib/validation'
import type { InviteCode } from '@/types/models'
import { useAdminTeams } from './useAdminTeams'

function joinLink(code: string) {
  return `${window.location.origin}/join?code=${code}`
}

function shareMessage(invite: InviteCode) {
  const greeting = invite.label ? `Assalam o Alaikum ${invite.label}!` : 'Assalam o Alaikum!'
  return (
    `${greeting} You're invited to join the ${BRAND_NAME} members app.\n\n` +
    `Open this link to join: ${joinLink(invite.code)}\n` +
    `Invite code: ${formatInviteCode(invite.code)} (works once, expires ${formatDate(invite.expiresAt)})`
  )
}

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${what} copied`)
  } catch {
    toast.error('Copy failed. Select the text and copy it manually.')
  }
}

type Tab = 'active' | 'all'

export function InvitesScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>('active')
  const [createOpen, setCreateOpen] = useState(searchParams.get('new') === '1')
  const [created, setCreated] = useState<InviteCode | null>(null)
  const { data, error, loading, reload } = useApi<{ invites: InviteCode[] }>('/api/admin/invites')
  const teams = useAdminTeams()

  // Drop ?new=1 from the URL once the dialog has opened.
  useEffect(() => {
    if (searchParams.get('new')) router.replace('/admin/invites', { scroll: false })
  }, [searchParams, router])

  const invites = data?.invites ?? []
  const visible = tab === 'active' ? invites.filter((i) => i.state === 'active') : invites

  const revoke = async (invite: InviteCode) => {
    if (!window.confirm(`Revoke code ${formatInviteCode(invite.code)}? It will stop working immediately.`)) return
    try {
      await api(`/api/admin/invites/${invite.code}`, { method: 'DELETE' })
      toast.success('Code revoked.')
      await reload()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Invite codes"
        description="Each code lets one person join. Share it on WhatsApp; it expires on its own."
        action={
          <Button onClick={() => setCreateOpen(true)} block className="sm:w-auto">
            <Plus className="h-5 w-5" aria-hidden="true" /> New invite code
          </Button>
        }
      />

      <div className="mb-5">
        <Segmented
          label="Invite codes"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'active', label: 'Unused', count: invites.filter((i) => i.state === 'active').length },
            { value: 'all', label: 'All codes', count: invites.length },
          ]}
        />
      </div>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={tab === 'active' ? 'No unused codes' : 'No codes yet'}
          action={
            <Button block onClick={() => setCreateOpen(true)}>
              Create one
            </Button>
          }
        >
          Create a code for each person you want to invite.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((invite) => (
            <li key={invite.code}>
              <InviteCard invite={invite} nameOf={teams.nameOf} onRevoke={() => void revoke(invite)} />
            </li>
          ))}
        </ul>
      )}

      <CreateInviteModal
        teams={teams.activeTeams}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(invite) => {
          setCreateOpen(false)
          setCreated(invite)
          void reload()
        }}
      />
      <CreatedModal invite={created} onClose={() => setCreated(null)} />
    </>
  )
}

function InviteCard({
  invite,
  onRevoke,
  nameOf,
}: {
  invite: InviteCode
  onRevoke: () => void
  nameOf: (id: string) => string
}) {
  const meta = INVITE_META[invite.state]
  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xl font-bold tracking-[0.15em] text-navy">{formatInviteCode(invite.code)}</p>
          <p className="truncate text-[15px] text-ink">{invite.label || <span className="text-muted">No label</span>}</p>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>
      <p className="text-sm text-muted">
        {invite.state === 'used'
          ? `Used by ${invite.usedByName ?? 'someone'} on ${formatDate(invite.usedAt)}`
          : invite.state === 'active'
            ? `Expires ${formatDate(invite.expiresAt)}`
            : `Created ${formatDate(invite.createdAt)} by ${invite.createdByName}`}
        {invite.suggestedTeams.length > 0 && ` · ${invite.suggestedTeams.map(nameOf).join(', ')}`}
      </p>
      {invite.state === 'active' && (
        <div className="mt-auto flex gap-2 pt-1">
          <ButtonLink
            href={`https://wa.me/?text=${encodeURIComponent(shareMessage(invite))}`}
            external
            variant="whatsapp"
            className="flex-1"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> Share
          </ButtonLink>
          <Button variant="secondary" onClick={() => void copy(joinLink(invite.code), 'Join link')} aria-label="Copy join link">
            <Copy className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button variant="danger" onClick={onRevoke} aria-label="Revoke code">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      )}
    </Card>
  )
}

function CreateInviteModal({
  teams: activeTeams,
  open,
  onClose,
  onCreated,
}: {
  teams: { id: string; name: string; description: string }[]
  open: boolean
  onClose: () => void
  onCreated: (invite: InviteCode) => void
}) {
  const [label, setLabel] = useState('')
  const [teams, setTeams] = useState<string[]>([])
  const [days, setDays] = useState('7')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setLabel('')
      setTeams([])
      setDays('7')
    }
  }, [open])

  const create = async () => {
    setBusy(true)
    try {
      const { invite } = await api<{ invite: InviteCode }>('/api/admin/invites', {
        body: { label, suggestedTeams: teams, expiresInDays: Number(days) },
      })
      onCreated(invite)
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
      title="New invite code"
      description="One code per person. You can share it on WhatsApp next."
      footer={
        <>
          <Button variant="secondary" block className="sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button block className="sm:w-auto" onClick={create} loading={busy}>
            Create code
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <TextField
          label="Who is it for?"
          optional
          placeholder="e.g. Ali Raza"
          hint="Only admins see this. It helps you track who used which code."
          value={label}
          maxLength={80}
          onChange={(event) => setLabel(event.target.value)}
        />
        <TeamPicker
          label="Suggested teams"
          hint="Pre-selected for them when they join. They can change it."
          teams={activeTeams}
          value={teams}
          onChange={setTeams}
        />
        <SelectField label="Expires after" value={days} onChange={(event) => setDays(event.target.value)}>
          <option value="3">3 days</option>
          <option value="7">7 days</option>
          <option value="14">14 days</option>
          <option value="30">30 days</option>
        </SelectField>
      </div>
    </Modal>
  )
}

function CreatedModal({ invite, onClose }: { invite: InviteCode | null; onClose: () => void }) {
  if (!invite) return null
  return (
    <Modal
      open
      onClose={onClose}
      title="Invite code ready"
      footer={
        <Button block variant="secondary" className="sm:w-auto" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="rounded-card bg-navy px-5 py-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            {invite.label || 'Invite code'}
          </p>
          <p className="mt-2 font-mono text-[32px] font-bold tracking-[0.2em] text-white">
            {formatInviteCode(invite.code)}
          </p>
          <p className="mt-1 text-sm text-onnavy">Expires {formatDate(invite.expiresAt)}</p>
        </div>
        <ButtonLink
          href={`https://wa.me/?text=${encodeURIComponent(shareMessage(invite))}`}
          external
          variant="whatsapp"
          block
          size="lg"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" /> Share on WhatsApp
        </ButtonLink>
        <Button variant="secondary" block onClick={() => void copy(shareMessage(invite), 'Invite message')}>
          <Copy className="h-5 w-5" aria-hidden="true" /> Copy invite message
        </Button>
      </div>
    </Modal>
  )
}

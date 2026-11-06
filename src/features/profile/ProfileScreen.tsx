'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { DoorOpen, FileCheck2, LogOut, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ReasonDialog } from '@/components/shared/ReasonDialog'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, DetailList, SectionTitle } from '@/components/ui/Card'
import { TextField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/features/auth/AuthProvider'
import { useApi } from '@/hooks/useApi'
import { api } from '@/lib/api/client'
import { errorMessage, formatDate, POSITION_META, STATUS_META } from '@/lib/format'
import { profileSchema, type ProfileInput } from '@/lib/validation'
import type { TeamSummary, UserProfile } from '@/types/models'

export function ProfileScreen() {
  const { me, isAdmin, signOut } = useAuth()
  const [editing, setEditing] = useState(false)
  const teams = useApi<{ teams: TeamSummary[] }>('/api/teams')
  const profile = me?.profile
  if (!profile) return null

  const status = STATUS_META[profile.status]
  const positions = Object.entries(profile.teams)
  const teamName = (id: string) => teams.data?.teams.find((team) => team.id === id)?.name ?? id

  return (
    <div className="space-y-5 px-4 pt-6">
      {/* Identity */}
      <Card className="flex flex-col items-center text-center">
        <Avatar name={profile.fullName} size="lg" />
        <h1 className="mt-3 text-[22px] text-navy">{profile.fullName}</h1>
        <p className="text-[15px] text-muted">{profile.email}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Badge tone={status.tone}>{status.label}</Badge>
          {isAdmin && <Badge tone="gold">Admin</Badge>}
        </div>
        <Button variant="secondary" className="mt-5 w-full sm:w-auto" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" aria-hidden="true" /> Edit profile
        </Button>
      </Card>

      {/* Details */}
      <section>
        <SectionTitle eyebrow="About you" title="Your details" />
        <DetailList
          items={[
            { label: 'WhatsApp', value: profile.phone || '-' },
            { label: 'Department', value: profile.department || '-' },
            { label: 'Batch', value: profile.batch || '-' },
            {
              label: 'Skills',
              value: profile.skills.length ? (
                <span className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} tone="navy">
                      {skill}
                    </Badge>
                  ))}
                </span>
              ) : (
                '-'
              ),
            },
            {
              label: 'Teams',
              value: positions.length ? (
                <span className="flex flex-wrap gap-1.5">
                  {positions.map(([teamId, position]) => (
                    <Badge key={teamId} tone={POSITION_META[position].tone}>
                      {teamName(teamId)} · {POSITION_META[position].label}
                    </Badge>
                  ))}
                </span>
              ) : (
                'Not in a team yet'
              ),
            },
            { label: 'Member since', value: formatDate(profile.approvedAt ?? profile.createdAt) },
          ]}
        />
      </section>

      {/* Agreement */}
      <Link
        href="/nda"
        className="flex min-h-[64px] items-center gap-4 rounded-card bg-surface p-4 shadow-card transition hover:bg-panel"
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
          <FileCheck2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block font-bold text-navy">Member agreement</span>
          <span className="block text-sm text-muted">
            Version {profile.ndaVersionSigned} signed {formatDate(profile.ndaSignedAt)} · View
          </span>
        </span>
      </Link>

      {!isAdmin && <LeaveSection />}

      <Button variant="secondary" block onClick={() => void signOut()}>
        <LogOut className="h-5 w-5" aria-hidden="true" /> Sign out
      </Button>

      <EditProfileModal open={editing} onClose={() => setEditing(false)} profile={profile} />
    </div>
  )
}

function LeaveSection() {
  const { me, refresh } = useAuth()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const pending = me?.leaveRequest?.status === 'pending' ? me.leaveRequest : null

  const request = async (reason: string) => {
    setBusy(true)
    try {
      await api('/api/me/leave-request', { body: { reason } })
      toast.success('Request sent to the admins.')
      setOpen(false)
      await refresh()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const cancel = async () => {
    setBusy(true)
    try {
      await api('/api/me/leave-request', { method: 'DELETE' })
      toast.success('Request cancelled. Glad you’re staying!')
      await refresh()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <SectionTitle eyebrow="Membership" title="Leaving KKB" />
      <Card className="space-y-4">
        {pending ? (
          <>
            <div className="rounded-r-control border-l-[3px] border-gold bg-warning-bg px-4 py-3">
              <p className="font-bold text-navy">Your request to leave is with the admins</p>
              <p className="mt-1 text-[15px] text-ink-soft">
                Sent {formatDate(pending.createdAt)}. You stay a member until an admin approves it.
              </p>
            </div>
            <Button variant="secondary" block onClick={cancel} loading={busy}>
              Cancel my request
            </Button>
          </>
        ) : (
          <>
            <p className="text-[15px] text-ink-soft">
              If you need to step away, you can ask to leave. An admin will approve it and you&apos;ll become KKB
              alumni. The member agreement still applies after you leave.
            </p>
            <Button variant="danger" block onClick={() => setOpen(true)}>
              <DoorOpen className="h-5 w-5" aria-hidden="true" /> Request to leave
            </Button>
          </>
        )}
      </Card>

      <ReasonDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={request}
        busy={busy}
        required={false}
        tone="danger"
        title="Request to leave KKB?"
        description="An admin will review your request. You can cancel it until then."
        label="Anything you'd like to share?"
        placeholder="e.g. Exams this semester, moving cities…"
        confirmLabel="Send request"
      />
    </section>
  )
}

function EditProfileModal({
  open,
  onClose,
  profile,
}: {
  open: boolean
  onClose: () => void
  profile: UserProfile
}) {
  const { refresh } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: profile.fullName,
      phone: profile.phone,
      department: profile.department,
      batch: profile.batch,
      skills: profile.skills.join(', '),
    },
  })

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api('/api/me', { method: 'PATCH', body: values })
      toast.success('Profile updated.')
      await refresh()
      onClose()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  })

  return (
    <Modal
      open={open}
      onClose={close}
      title="Edit profile"
      footer={
        <>
          <Button variant="secondary" block className="sm:w-auto" onClick={close}>
            Cancel
          </Button>
          <Button block className="sm:w-auto" onClick={onSubmit} loading={isSubmitting}>
            Save changes
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField label="Full name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
        <TextField
          label="WhatsApp number"
          type="tel"
          inputMode="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <TextField label="Department" optional error={errors.department?.message} {...register('department')} />
        <TextField label="Batch" optional error={errors.batch?.message} {...register('batch')} />
        <TextField
          label="Skills"
          optional
          hint="Separate with commas."
          error={errors.skills?.message}
          {...register('skills')}
        />
        {profile.fullName && (
          <p className="text-sm text-muted">
            Changing your name won&apos;t change the name on your signed agreement.
          </p>
        )}
      </form>
    </Modal>
  )
}

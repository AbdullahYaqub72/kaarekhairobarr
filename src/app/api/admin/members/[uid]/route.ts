import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'
import { requiredReasonSchema } from '@/lib/validation'
import { logAudit } from '@/server/audit'
import { requireAdmin } from '@/server/auth'
import { ApiError, handle, json, nowIso, parseBody } from '@/server/http'
import { leaveCol, listLeaveRequests } from '@/server/leave'
import { validTeamIds, vacatePositions } from '@/server/teams'
import { getUser, toProfile, usersCol } from '@/server/users'
import type { AdminMemberDetail, NdaSignature, TeamMemberships } from '@/types/models'

export const dynamic = 'force-dynamic'

type Params = { uid: string }

export const GET = handle<Params>(async (req, { params }) => {
  await requireAdmin(req)
  const profile = await getUser(params.uid)
  if (!profile) throw new ApiError(404, 'Member not found.')

  const [signatureSnap, leaveRequests] = await Promise.all([
    profile.ndaVersionSigned
      ? adminDb().collection('ndaSignatures').doc(`${profile.uid}_v${profile.ndaVersionSigned}`).get()
      : null,
    listLeaveRequests(profile.uid),
  ])

  const body: AdminMemberDetail = {
    profile,
    signature: signatureSnap?.exists ? (signatureSnap.data() as NdaSignature) : null,
    leaveRequests,
  }
  return json(body)
})

const reason = requiredReasonSchema.shape.reason
const teamList = z.array(z.string()).max(20)

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approve'), teams: teamList }),
  z.object({ action: z.literal('reject'), reason }),
  z.object({ action: z.literal('suspend'), reason }),
  z.object({ action: z.literal('restore') }),
  z.object({ action: z.literal('remove'), reason }),
  z.object({ action: z.literal('setTeams'), teams: teamList }),
])

/** Status and team changes for one member. */
export const POST = handle<Params>(async (req, { params }) => {
  const { profile: admin } = await requireAdmin(req)
  const input = await parseBody(req, actionSchema)
  const teamIds = 'teams' in input ? await validTeamIds(input.teams) : []
  const userRef = usersCol().doc(params.uid)

  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(userRef)
    if (!snap.exists) throw new ApiError(404, 'Member not found.')
    const target = toProfile(snap.id, snap.data()!)
    const now = nowIso()

    if (input.action !== 'setTeams') {
      if (target.uid === admin.uid) throw new ApiError(400, 'You cannot change your own status.')
      if (target.orgRole === 'admin') throw new ApiError(400, "Another admin's status can't be changed here.")
    }

    const requireStatus = (...allowed: string[]) => {
      if (!allowed.includes(target.status)) {
        throw new ApiError(409, 'This member’s status changed in the meantime. Refresh and try again.')
      }
    }

    switch (input.action) {
      case 'approve': {
        requireStatus('pending_approval')
        const teams: TeamMemberships = Object.fromEntries(teamIds.map((id) => [id, 'member']))
        tx.update(userRef, {
          status: 'active',
          teams,
          statusReason: null,
          approvedAt: now,
          approvedBy: admin.uid,
          updatedAt: now,
        })
        break
      }
      case 'reject': {
        requireStatus('registered', 'pending_approval')
        tx.update(userRef, { status: 'rejected', statusReason: input.reason, teams: {}, updatedAt: now })
        break
      }
      case 'suspend': {
        requireStatus('active')
        tx.update(userRef, { status: 'suspended', statusReason: input.reason, updatedAt: now })
        break
      }
      case 'restore': {
        requireStatus('suspended')
        tx.update(userRef, { status: 'active', statusReason: null, updatedAt: now })
        break
      }
      case 'remove': {
        requireStatus('active', 'suspended')
        vacatePositions(tx, target.uid, target.teams)
        if (target.pendingLeaveRequestId) {
          tx.update(leaveCol().doc(target.pendingLeaveRequestId), {
            status: 'cancelled',
            reviewedBy: admin.uid,
            reviewedByName: admin.fullName,
            reviewedAt: now,
            reviewNote: 'Member was removed by an admin.',
          })
        }
        tx.update(userRef, {
          status: 'alumni',
          statusReason: input.reason,
          formerTeams: Object.keys(target.teams),
          teams: {},
          pendingLeaveRequestId: null,
          updatedAt: now,
        })
        break
      }
      case 'setTeams': {
        requireStatus('active', 'suspended')
        const next: TeamMemberships = Object.fromEntries(
          teamIds.map((id) => [id, target.teams[id] ?? 'member'])
        )
        const dropped = Object.fromEntries(
          Object.entries(target.teams).filter(([id]) => !(id in next))
        ) as TeamMemberships
        vacatePositions(tx, target.uid, dropped)
        tx.update(userRef, { teams: next, updatedAt: now })
        break
      }
    }
  })

  await logAudit(admin.uid, `member.${input.action}`, { type: 'user', id: params.uid }, {
    ...('reason' in input ? { reason: input.reason } : {}),
    ...('teams' in input ? { teams: teamIds } : {}),
  })
  return json({ ok: true })
})

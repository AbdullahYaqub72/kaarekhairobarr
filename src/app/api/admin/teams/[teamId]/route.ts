import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'
import { teamSchema } from '@/lib/validation'
import { logAudit } from '@/server/audit'
import { requireAdmin } from '@/server/auth'
import { ApiError, handle, json, parseBody } from '@/server/http'
import { teamsCol, toTeam } from '@/server/teams'
import { toProfile, usersCol } from '@/server/users'

export const dynamic = 'force-dynamic'

type Params = { teamId: string }

const updateSchema = teamSchema.partial().extend({ active: z.boolean().optional() })

/** Rename, re-describe, archive or restore a team. */
export const PATCH = handle<Params>(async (req, { params }) => {
  const { profile: admin } = await requireAdmin(req)
  const input = await parseBody(req, updateSchema)
  const ref = teamsCol().doc(params.teamId)
  const snap = await ref.get()
  if (!snap.exists) throw new ApiError(404, 'Team not found.')

  const update = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined))
  if (Object.keys(update).length === 0) throw new ApiError(400, 'Nothing to update.')
  await ref.update(update)

  await logAudit(admin.uid, 'team.updated', { type: 'team', id: params.teamId }, update)
  return json({ ok: true })
})

const leadershipSchema = z.object({
  position: z.enum(['lead', 'co-lead']),
  uid: z.string().min(1).nullable(),
})

/**
 * Appoint (or clear) the team's lead or co-lead. The previous holder becomes
 * a regular member of the team; the new one is added to the team if needed.
 */
export const POST = handle<Params>(async (req, { params }) => {
  const { profile: admin } = await requireAdmin(req)
  const { position, uid } = await parseBody(req, leadershipSchema)
  const teamRef = teamsCol().doc(params.teamId)
  const slot = position === 'lead' ? 'leadUid' : 'coLeadUid'
  const otherSlot = position === 'lead' ? 'coLeadUid' : 'leadUid'

  await adminDb().runTransaction(async (tx) => {
    const teamSnap = await tx.get(teamRef)
    if (!teamSnap.exists) throw new ApiError(404, 'Team not found.')
    const team = toTeam(teamSnap.id, teamSnap.data()!)
    if (!team.active) throw new ApiError(409, 'Restore the team before appointing leaders.')

    const previousUid = team[slot]
    if (previousUid === uid) return

    const newSnap = uid ? await tx.get(usersCol().doc(uid)) : null
    const previousSnap = previousUid ? await tx.get(usersCol().doc(previousUid)) : null

    if (uid) {
      if (!newSnap?.exists) throw new ApiError(404, 'Member not found.')
      const member = toProfile(newSnap.id, newSnap.data()!)
      if (member.status !== 'active') throw new ApiError(409, 'Only active members can lead a team.')
    }

    // All reads are done; now the writes.
    const teamUpdate: Record<string, string | null> = { [slot]: uid }
    if (uid && team[otherSlot] === uid) teamUpdate[otherSlot] = null
    tx.update(teamRef, teamUpdate)

    if (previousUid && previousSnap?.exists && previousSnap.data()?.teams?.[team.id]) {
      tx.update(usersCol().doc(previousUid), { [`teams.${team.id}`]: 'member' })
    }
    if (uid) tx.update(usersCol().doc(uid), { [`teams.${team.id}`]: position })
  })

  await logAudit(admin.uid, `team.${position}.set`, { type: 'team', id: params.teamId }, { uid })
  return json({ ok: true })
})

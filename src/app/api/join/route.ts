import { adminDb } from '@/lib/firebase/admin'
import { joinSchema, normalizeInviteCode, splitSkills } from '@/lib/validation'
import { logAudit } from '@/server/audit'
import { getCaller } from '@/server/auth'
import { ApiError, handle, json, nowIso, parseBody } from '@/server/http'
import { assertUsable, invitesCol } from '@/server/invites'
import { validTeamIds } from '@/server/teams'
import { usersCol } from '@/server/users'

export const dynamic = 'force-dynamic'

/** Redeems an invite code and creates the member's profile (status: registered). */
export const POST = handle(async (req) => {
  const token = await getCaller(req)
  const input = await parseBody(req, joinSchema)
  const code = normalizeInviteCode(input.code)
  const requestedTeams = await validTeamIds(input.requestedTeams)

  const codeRef = invitesCol().doc(code)
  const userRef = usersCol().doc(token.uid)

  await adminDb().runTransaction(async (tx) => {
    const [codeSnap, userSnap] = await Promise.all([tx.get(codeRef), tx.get(userRef)])
    assertUsable(codeSnap)

    const existing = userSnap.data()
    // People who were turned away or left can come back with a new code.
    if (existing && !['rejected', 'alumni'].includes(existing.status)) {
      throw new ApiError(409, 'This account is already registered with KKB.')
    }

    const now = nowIso()
    tx.set(userRef, {
      email: token.email ?? '',
      fullName: input.profile.fullName,
      phone: input.profile.phone,
      department: input.profile.department,
      batch: input.profile.batch,
      skills: splitSkills(input.profile.skills),
      requestedTeams,
      orgRole: 'member',
      status: 'registered',
      teams: {},
      ndaVersionSigned: null,
      ndaSignedAt: null,
      statusReason: null,
      pendingLeaveRequestId: null,
      inviteCode: code,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      approvedAt: null,
      approvedBy: null,
    })
    tx.update(codeRef, { usedBy: token.uid, usedByName: input.profile.fullName, usedAt: now })
  })

  await logAudit(token.uid, 'member.joined', { type: 'user', id: token.uid }, { code })
  return json({ ok: true }, 201)
})

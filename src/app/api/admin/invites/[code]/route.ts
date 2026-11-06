import { adminDb } from '@/lib/firebase/admin'
import { normalizeInviteCode } from '@/lib/validation'
import { logAudit } from '@/server/audit'
import { requireAdmin } from '@/server/auth'
import { ApiError, handle, json, nowIso } from '@/server/http'
import { invitesCol, inviteState } from '@/server/invites'

export const dynamic = 'force-dynamic'

/** Revoke an unused invite code. */
export const DELETE = handle<{ code: string }>(async (req, { params }) => {
  const { profile: admin } = await requireAdmin(req)
  const ref = invitesCol().doc(normalizeInviteCode(params.code))

  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) throw new ApiError(404, 'Invite code not found.')
    if (inviteState(snap.data()!) !== 'active') {
      throw new ApiError(409, 'Only unused, unexpired codes can be revoked.')
    }
    tx.update(ref, { revokedAt: nowIso() })
  })

  await logAudit(admin.uid, 'invite.revoked', { type: 'invite', id: ref.id })
  return json({ ok: true })
})

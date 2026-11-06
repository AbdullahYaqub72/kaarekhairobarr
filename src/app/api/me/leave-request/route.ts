import { adminDb } from '@/lib/firebase/admin'
import { reasonSchema } from '@/lib/validation'
import { logAudit } from '@/server/audit'
import { requireMember } from '@/server/auth'
import { ApiError, handle, json, nowIso, parseBody } from '@/server/http'
import { leaveCol } from '@/server/leave'
import { usersCol } from '@/server/users'

export const dynamic = 'force-dynamic'

/** Ask to leave KKB. Stays active until an admin approves. */
export const POST = handle(async (req) => {
  // Members who won't sign a new agreement version can still leave.
  const { profile } = await requireMember(req, { allowOutdatedNda: true })
  if (profile.orgRole === 'admin') {
    throw new ApiError(400, 'Admins cannot leave through the app. Talk to the other founder.')
  }
  const { reason } = await parseBody(req, reasonSchema)

  const userRef = usersCol().doc(profile.uid)
  const requestRef = leaveCol().doc()

  await adminDb().runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef)
    if (userSnap.data()?.pendingLeaveRequestId) {
      throw new ApiError(409, 'You already have a pending request to leave.')
    }
    const now = nowIso()
    tx.set(requestRef, {
      uid: profile.uid,
      userName: profile.fullName,
      reason,
      status: 'pending',
      createdAt: now,
      reviewedBy: null,
      reviewedByName: null,
      reviewedAt: null,
      reviewNote: null,
    })
    tx.update(userRef, { pendingLeaveRequestId: requestRef.id, updatedAt: now })
  })

  await logAudit(profile.uid, 'leave.requested', { type: 'leaveRequest', id: requestRef.id })
  return json({ id: requestRef.id }, 201)
})

/** Cancel your own pending request. */
export const DELETE = handle(async (req) => {
  const { profile } = await requireMember(req, { allowOutdatedNda: true })
  const requestId = profile.pendingLeaveRequestId
  if (!requestId) throw new ApiError(404, 'You have no pending request to leave.')

  await adminDb().runTransaction(async (tx) => {
    const requestRef = leaveCol().doc(requestId)
    const snap = await tx.get(requestRef)
    if (snap.exists && snap.data()?.status === 'pending') {
      tx.update(requestRef, { status: 'cancelled', reviewedAt: nowIso() })
    }
    tx.update(usersCol().doc(profile.uid), { pendingLeaveRequestId: null, updatedAt: nowIso() })
  })

  await logAudit(profile.uid, 'leave.cancelled', { type: 'leaveRequest', id: requestId })
  return json({ ok: true })
})

import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'
import { logAudit } from '@/server/audit'
import { requireAdmin } from '@/server/auth'
import { ApiError, handle, json, nowIso, parseBody } from '@/server/http'
import { leaveCol } from '@/server/leave'
import { vacatePositions } from '@/server/teams'
import { toProfile, usersCol } from '@/server/users'

export const dynamic = 'force-dynamic'

const schema = z.object({
  action: z.enum(['approve', 'decline']),
  note: z.string().trim().max(500, 'Keep it under 500 characters.'),
})

export const POST = handle<{ id: string }>(async (req, { params }) => {
  const { profile: admin } = await requireAdmin(req)
  const input = await parseBody(req, schema)
  if (input.action === 'decline' && input.note.length < 3) {
    throw new ApiError(400, 'Add a short note so the member knows why.')
  }

  const requestRef = leaveCol().doc(params.id)
  let memberUid = ''

  await adminDb().runTransaction(async (tx) => {
    const requestSnap = await tx.get(requestRef)
    if (!requestSnap.exists) throw new ApiError(404, 'Request not found.')
    const request = requestSnap.data()!
    if (request.status !== 'pending') throw new ApiError(409, 'This request was already handled.')

    memberUid = request.uid
    const userRef = usersCol().doc(request.uid)
    const userSnap = await tx.get(userRef)
    const now = nowIso()

    tx.update(requestRef, {
      status: input.action === 'approve' ? 'approved' : 'declined',
      reviewedBy: admin.uid,
      reviewedByName: admin.fullName,
      reviewedAt: now,
      reviewNote: input.note || null,
    })

    if (!userSnap.exists) return
    const member = toProfile(userSnap.id, userSnap.data()!)

    if (input.action === 'approve') {
      vacatePositions(tx, member.uid, member.teams)
      tx.update(userRef, {
        status: 'alumni',
        statusReason: 'Left KKB (request approved).',
        formerTeams: Object.keys(member.teams),
        teams: {},
        pendingLeaveRequestId: null,
        updatedAt: now,
      })
    } else {
      tx.update(userRef, { pendingLeaveRequestId: null, updatedAt: now })
    }
  })

  await logAudit(admin.uid, `leave.${input.action}d`, { type: 'leaveRequest', id: params.id }, {
    memberUid,
    note: input.note,
  })
  return json({ ok: true })
})

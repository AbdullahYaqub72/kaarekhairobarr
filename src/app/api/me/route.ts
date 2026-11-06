import { NDA } from '@/config/nda'
import { profileSchema, splitSkills } from '@/lib/validation'
import { getCaller, requireProfile } from '@/server/auth'
import { ApiError, handle, json, nowIso, parseBody } from '@/server/http'
import { getLeaveRequest } from '@/server/leave'
import { getUser, usersCol } from '@/server/users'
import type { MeResponse } from '@/types/models'

export const dynamic = 'force-dynamic'

/** The signed-in person's profile and where they are in the joining flow. */
export const GET = handle(async (req) => {
  const token = await getCaller(req)
  const profile = await getUser(token.uid)
  const leaveRequest = profile?.pendingLeaveRequestId
    ? await getLeaveRequest(profile.pendingLeaveRequestId)
    : null

  const body: MeResponse = {
    user: { uid: token.uid, email: token.email ?? null },
    profile,
    ndaVersion: NDA.version,
    leaveRequest,
  }
  return json(body)
})

/** Edit your own profile details. Role, status and teams are admin-only. */
export const PATCH = handle(async (req) => {
  const { profile } = await requireProfile(req)
  if (!['registered', 'pending_approval', 'active'].includes(profile.status)) {
    throw new ApiError(403, 'Your profile can no longer be edited.')
  }
  const input = await parseBody(req, profileSchema)

  await usersCol().doc(profile.uid).update({
    fullName: input.fullName,
    phone: input.phone,
    department: input.department,
    batch: input.batch,
    skills: splitSkills(input.skills),
    updatedAt: nowIso(),
  })
  return json({ ok: true })
})

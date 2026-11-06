import { inviteCreateSchema } from '@/lib/validation'
import { logAudit } from '@/server/audit'
import { requireAdmin } from '@/server/auth'
import { ApiError, handle, json, nowIso, parseBody } from '@/server/http'
import { generateCode, invitesCol, toInvite } from '@/server/invites'
import { validTeamIds } from '@/server/teams'

export const dynamic = 'force-dynamic'

export const GET = handle(async (req) => {
  await requireAdmin(req)
  const snap = await invitesCol().orderBy('createdAt', 'desc').limit(200).get()
  return json({ invites: snap.docs.map((doc) => toInvite(doc.id, doc.data())) })
})

export const POST = handle(async (req) => {
  const { profile: admin } = await requireAdmin(req)
  const input = await parseBody(req, inviteCreateSchema)
  const suggestedTeams = await validTeamIds(input.suggestedTeams)

  const now = new Date()
  const data = {
    label: input.label,
    suggestedTeams,
    createdBy: admin.uid,
    createdByName: admin.fullName,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + input.expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
    usedBy: null,
    usedByName: null,
    usedAt: null,
    revokedAt: null,
  }

  // `create` fails if the code already exists, so a collision just retries.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode()
    try {
      await invitesCol().doc(code).create(data)
      await logAudit(admin.uid, 'invite.created', { type: 'invite', id: code }, { label: input.label })
      return json({ invite: toInvite(code, data) }, 201)
    } catch (error) {
      if ((error as { code?: number }).code !== 6) throw error // 6 = ALREADY_EXISTS
    }
  }
  throw new ApiError(500, `Could not create a unique code at ${nowIso()}. Please try again.`)
})

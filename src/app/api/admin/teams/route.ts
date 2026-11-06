import { teamSchema } from '@/lib/validation'
import { logAudit } from '@/server/audit'
import { requireAdmin } from '@/server/auth'
import { ApiError, handle, json, nowIso, parseBody } from '@/server/http'
import { listTeams, slugify, summarizeTeams, teamsCol } from '@/server/teams'
import { listUsers } from '@/server/users'

export const dynamic = 'force-dynamic'

export const GET = handle(async (req) => {
  await requireAdmin(req)
  const [teams, users] = await Promise.all([listTeams({ includeArchived: true }), listUsers()])
  return json({ teams: summarizeTeams(teams, users) })
})

export const POST = handle(async (req) => {
  const { profile: admin } = await requireAdmin(req)
  const input = await parseBody(req, teamSchema)
  const id = slugify(input.name)
  if (!id) throw new ApiError(400, 'Use letters or numbers in the team name.')

  const existing = await listTeams({ includeArchived: true })
  try {
    await teamsCol()
      .doc(id)
      .create({
        name: input.name,
        description: input.description,
        active: true,
        leadUid: null,
        coLeadUid: null,
        order: existing.length,
        createdAt: nowIso(),
      })
  } catch (error) {
    if ((error as { code?: number }).code === 6) {
      throw new ApiError(409, 'A team with this name already exists.')
    }
    throw error
  }

  await logAudit(admin.uid, 'team.created', { type: 'team', id }, { name: input.name })
  return json({ id }, 201)
})

import { requireMember } from '@/server/auth'
import { handle, json } from '@/server/http'
import { listTeams, summarizeTeams } from '@/server/teams'
import { listUsers } from '@/server/users'

export const dynamic = 'force-dynamic'

/** All active teams, with the caller's own position in each. */
export const GET = handle(async (req) => {
  const { profile } = await requireMember(req)
  const [teams, users] = await Promise.all([listTeams(), listUsers()])
  return json({ teams: summarizeTeams(teams, users, profile) })
})

import { comparePositions } from '@/lib/format'
import { requireMember } from '@/server/auth'
import { ApiError, handle, json } from '@/server/http'
import { getTeam, summarizeTeams } from '@/server/teams'
import { listUsers } from '@/server/users'
import type { RosterMember, TeamDetailResponse } from '@/types/models'

export const dynamic = 'force-dynamic'

/** A team's roster. Contact details only for admins and the team's leads. */
export const GET = handle<{ teamId: string }>(async (req, { params }) => {
  const { profile } = await requireMember(req)
  const team = await getTeam(params.teamId)
  if (!team || !team.active) throw new ApiError(404, 'Team not found.')

  const isAdmin = profile.orgRole === 'admin'
  const myPosition = profile.teams[team.id]
  if (!isAdmin && !myPosition) throw new ApiError(403, 'You can only see teams you belong to.')

  const canSeeContacts = isAdmin || myPosition === 'lead' || myPosition === 'co-lead'
  const users = await listUsers()

  const roster: RosterMember[] = users
    .filter((user) => user.status === 'active' && user.teams[team.id])
    .map((user) => ({
      uid: user.uid,
      fullName: user.fullName,
      position: user.teams[team.id]!,
      ...(canSeeContacts ? { phone: user.phone, email: user.email } : {}),
    }))
    .sort((a, b) => comparePositions(a.position, b.position) || a.fullName.localeCompare(b.fullName))

  const body: TeamDetailResponse = {
    team: summarizeTeams([team], users, profile)[0]!,
    roster,
    canSeeContacts,
  }
  return json(body)
})

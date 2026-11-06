import { requireAdmin } from '@/server/auth'
import { handle, json } from '@/server/http'
import { invitesCol, inviteState } from '@/server/invites'
import { leaveCol } from '@/server/leave'
import { listTeams } from '@/server/teams'
import { listUsers } from '@/server/users'
import type { AdminOverview } from '@/types/models'

export const dynamic = 'force-dynamic'

export const GET = handle(async (req) => {
  await requireAdmin(req)
  const [users, teams, leaveSnap, inviteSnap] = await Promise.all([
    listUsers(),
    listTeams(),
    leaveCol().where('status', '==', 'pending').get(),
    invitesCol().where('usedBy', '==', null).get(),
  ])

  const body: AdminOverview = {
    pendingMembers: users.filter((user) => user.status === 'pending_approval').length,
    pendingLeaveRequests: leaveSnap.size,
    activeMembers: users.filter((user) => user.status === 'active').length,
    activeInvites: inviteSnap.docs.filter((doc) => inviteState(doc.data()) === 'active').length,
    vacantLeadTeams: teams.filter((team) => !team.leadUid).map((team) => team.name),
  }
  return json(body)
})

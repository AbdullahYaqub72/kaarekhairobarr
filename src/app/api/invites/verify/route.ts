import { z } from 'zod'
import { normalizeInviteCode } from '@/lib/validation'
import { ApiError, handle, json, parseBody } from '@/server/http'
import { assertUsable, invitesCol } from '@/server/invites'
import { listTeams } from '@/server/teams'
import type { InviteCheckResponse } from '@/types/models'

export const dynamic = 'force-dynamic'

const schema = z.object({ code: z.string() })

/** Step 1 of joining: check a code before asking the person to sign up. */
export const POST = handle(async (req) => {
  const { code: raw } = await parseBody(req, schema)
  const code = normalizeInviteCode(raw)
  if (code.length !== 8) throw new ApiError(400, 'Invite codes have 8 letters and numbers.')

  const invite = assertUsable(await invitesCol().doc(code).get())
  const teams = await listTeams()

  const body: InviteCheckResponse = {
    code,
    label: invite.label,
    suggestedTeams: invite.suggestedTeams,
    teams: teams.map(({ id, name, description }) => ({ id, name, description })),
  }
  return json(body)
})

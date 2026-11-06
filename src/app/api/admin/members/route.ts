import { requireAdmin } from '@/server/auth'
import { handle, json } from '@/server/http'
import { listUsers } from '@/server/users'

export const dynamic = 'force-dynamic'

/** Everyone with a profile. The admin screen groups them by status. */
export const GET = handle(async (req) => {
  await requireAdmin(req)
  return json({ members: await listUsers() })
})

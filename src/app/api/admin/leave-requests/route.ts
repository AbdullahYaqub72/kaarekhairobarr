import { requireAdmin } from '@/server/auth'
import { handle, json } from '@/server/http'
import { listLeaveRequests } from '@/server/leave'

export const dynamic = 'force-dynamic'

export const GET = handle(async (req) => {
  await requireAdmin(req)
  return json({ requests: await listLeaveRequests() })
})

import 'server-only'
import { adminDb } from '@/lib/firebase/admin'
import { nowIso } from './http'

/** Append-only record of sensitive actions (approvals, role changes, …). */
export async function logAudit(
  actorUid: string,
  action: string,
  target: { type: 'user' | 'team' | 'invite' | 'leaveRequest'; id: string },
  details: Record<string, unknown> = {}
) {
  try {
    await adminDb().collection('auditLog').add({
      actorUid,
      action,
      targetType: target.type,
      targetId: target.id,
      details,
      at: nowIso(),
    })
  } catch (error) {
    // Never fail the user's action because the audit write failed.
    console.error('Audit log write failed', error)
  }
}

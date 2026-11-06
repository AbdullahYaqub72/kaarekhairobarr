import 'server-only'
import type { DocumentData } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import type { LeaveRequest } from '@/types/models'

export const leaveCol = () => adminDb().collection('leaveRequests')

export function toLeaveRequest(id: string, data: DocumentData): LeaveRequest {
  return {
    id,
    uid: data.uid ?? '',
    userName: data.userName ?? '',
    reason: data.reason ?? '',
    status: data.status ?? 'pending',
    createdAt: data.createdAt ?? '',
    reviewedBy: data.reviewedBy ?? null,
    reviewedByName: data.reviewedByName ?? null,
    reviewedAt: data.reviewedAt ?? null,
    reviewNote: data.reviewNote ?? null,
  }
}

export async function getLeaveRequest(id: string): Promise<LeaveRequest | null> {
  const snap = await leaveCol().doc(id).get()
  return snap.exists ? toLeaveRequest(snap.id, snap.data()!) : null
}

export async function listLeaveRequests(uid?: string): Promise<LeaveRequest[]> {
  const query = uid ? leaveCol().where('uid', '==', uid) : leaveCol()
  const snap = await query.get()
  return snap.docs
    .map((doc) => toLeaveRequest(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

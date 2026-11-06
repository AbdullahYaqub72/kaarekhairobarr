import 'server-only'
import type { DocumentData } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import type { TeamMemberships, UserProfile } from '@/types/models'

export const usersCol = () => adminDb().collection('users')

export function toProfile(uid: string, data: DocumentData): UserProfile {
  return {
    uid,
    email: data.email ?? '',
    fullName: data.fullName ?? '',
    phone: data.phone ?? '',
    department: data.department ?? '',
    batch: data.batch ?? '',
    skills: Array.isArray(data.skills) ? data.skills : [],
    requestedTeams: Array.isArray(data.requestedTeams) ? data.requestedTeams : [],
    orgRole: data.orgRole === 'admin' ? 'admin' : 'member',
    status: data.status ?? 'registered',
    teams: (data.teams ?? {}) as TeamMemberships,
    ndaVersionSigned: typeof data.ndaVersionSigned === 'number' ? data.ndaVersionSigned : null,
    ndaSignedAt: data.ndaSignedAt ?? null,
    statusReason: data.statusReason ?? null,
    pendingLeaveRequestId: data.pendingLeaveRequestId ?? null,
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? '',
    approvedAt: data.approvedAt ?? null,
  }
}

export async function getUser(uid: string): Promise<UserProfile | null> {
  const snap = await usersCol().doc(uid).get()
  return snap.exists ? toProfile(snap.id, snap.data()!) : null
}

/** KKB is small (tens of members), so we load everyone and filter in memory. */
export async function listUsers(): Promise<UserProfile[]> {
  const snap = await usersCol().get()
  return snap.docs
    .map((doc) => toProfile(doc.id, doc.data()))
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
}

export async function getUserNames(uids: (string | null)[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(uids.filter((uid): uid is string => Boolean(uid))))
  if (unique.length === 0) return new Map()
  const snaps = await adminDb().getAll(...unique.map((uid) => usersCol().doc(uid)))
  return new Map(snaps.filter((s) => s.exists).map((s) => [s.id, (s.data()?.fullName as string) ?? '']))
}

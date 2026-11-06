import 'server-only'
import type { DocumentData, Transaction } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import type { Team, TeamMemberships, TeamSummary, UserProfile } from '@/types/models'

export const teamsCol = () => adminDb().collection('teams')

export function toTeam(id: string, data: DocumentData): Team {
  return {
    id,
    name: data.name ?? id,
    description: data.description ?? '',
    active: data.active !== false,
    leadUid: data.leadUid ?? null,
    coLeadUid: data.coLeadUid ?? null,
    order: typeof data.order === 'number' ? data.order : 99,
    createdAt: data.createdAt ?? '',
  }
}

export async function listTeams({ includeArchived = false } = {}): Promise<Team[]> {
  const snap = await teamsCol().get()
  return snap.docs
    .map((doc) => toTeam(doc.id, doc.data()))
    .filter((team) => includeArchived || team.active)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
}

export async function getTeam(id: string): Promise<Team | null> {
  const snap = await teamsCol().doc(id).get()
  return snap.exists ? toTeam(snap.id, snap.data()!) : null
}

export function summarizeTeams(teams: Team[], users: UserProfile[], viewer?: UserProfile): TeamSummary[] {
  const active = users.filter((user) => user.status === 'active')
  const names = new Map(users.map((user) => [user.uid, user.fullName]))
  return teams.map((team) => ({
    ...team,
    memberCount: active.filter((user) => team.id in user.teams).length,
    leadName: team.leadUid ? names.get(team.leadUid) ?? null : null,
    coLeadName: team.coLeadUid ? names.get(team.coLeadUid) ?? null : null,
    myPosition: viewer?.teams[team.id] ?? null,
  }))
}

/** Keeps only ids of teams that exist and are active. */
export async function validTeamIds(ids: string[]): Promise<string[]> {
  const teams = await listTeams()
  const known = new Set(teams.map((team) => team.id))
  return Array.from(new Set(ids)).filter((id) => known.has(id))
}

/**
 * Inside a transaction: removes the user from any lead / co-lead slots they
 * hold in the given memberships. Call before removing them from teams.
 */
export function vacatePositions(tx: Transaction, uid: string, memberships: TeamMemberships) {
  for (const [teamId, position] of Object.entries(memberships)) {
    if (position === 'lead') tx.update(teamsCol().doc(teamId), { leadUid: null })
    if (position === 'co-lead') tx.update(teamsCol().doc(teamId), { coLeadUid: null })
  }
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

import 'server-only'
import { randomInt } from 'node:crypto'
import type { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import type { InviteCode, InviteState } from '@/types/models'
import { ApiError } from './http'

export const invitesCol = () => adminDb().collection('inviteCodes')

// No 0/O or 1/I/L, so codes are easy to read out and type on a phone.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateCode(length = 8) {
  let code = ''
  for (let i = 0; i < length; i++) code += ALPHABET[randomInt(ALPHABET.length)]
  return code
}

export function inviteState(data: DocumentData, now = Date.now()): InviteState {
  if (data.revokedAt) return 'revoked'
  if (data.usedBy) return 'used'
  if (new Date(data.expiresAt).getTime() < now) return 'expired'
  return 'active'
}

export function toInvite(code: string, data: DocumentData): InviteCode {
  return {
    code,
    label: data.label ?? '',
    suggestedTeams: Array.isArray(data.suggestedTeams) ? data.suggestedTeams : [],
    createdBy: data.createdBy ?? '',
    createdByName: data.createdByName ?? '',
    createdAt: data.createdAt ?? '',
    expiresAt: data.expiresAt ?? '',
    usedBy: data.usedBy ?? null,
    usedByName: data.usedByName ?? null,
    usedAt: data.usedAt ?? null,
    revokedAt: data.revokedAt ?? null,
    state: inviteState(data),
  }
}

/** Throws a friendly error unless the code can be used right now. */
export function assertUsable(snap: DocumentSnapshot): InviteCode {
  if (!snap.exists) throw new ApiError(404, 'That invite code is not valid. Check it and try again.')
  const invite = toInvite(snap.id, snap.data()!)
  if (invite.state === 'used') throw new ApiError(410, 'This invite code has already been used.')
  if (invite.state === 'expired') {
    throw new ApiError(410, 'This invite code has expired. Ask an admin for a new one.')
  }
  if (invite.state === 'revoked') throw new ApiError(410, 'This invite code was cancelled.')
  return invite
}

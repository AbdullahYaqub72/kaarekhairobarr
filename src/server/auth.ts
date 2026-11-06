import 'server-only'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { NDA } from '@/config/nda'
import { adminAuth } from '@/lib/firebase/admin'
import type { UserProfile } from '@/types/models'
import { ApiError } from './http'
import { getUser } from './users'

/** Verifies the Firebase ID token sent as `Authorization: Bearer <token>`. */
export async function getCaller(req: Request): Promise<DecodedIdToken> {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) throw new ApiError(401, 'Please sign in to continue.')

  const authClient = adminAuth()
  try {
    return await authClient.verifyIdToken(token)
  } catch {
    throw new ApiError(401, 'Your session has expired. Please sign in again.')
  }
}

/** Caller must have a KKB profile (any status). */
export async function requireProfile(req: Request) {
  const token = await getCaller(req)
  const profile = await getUser(token.uid)
  if (!profile) throw new ApiError(403, 'You are not a KKB member yet. Join with an invite code.')
  return { token, profile }
}

interface MemberOptions {
  admin?: boolean
  /** Lets members with an outdated agreement still act (e.g. request to leave). */
  allowOutdatedNda?: boolean
}

/** Caller must be an active member who has signed the current agreement. */
export async function requireMember(
  req: Request,
  { admin = false, allowOutdatedNda = false }: MemberOptions = {}
): Promise<{ token: DecodedIdToken; profile: UserProfile }> {
  const { token, profile } = await requireProfile(req)
  if (profile.status !== 'active') throw new ApiError(403, 'Your account is not active.')
  if (!allowOutdatedNda && profile.ndaVersionSigned !== NDA.version) {
    throw new ApiError(403, 'Please sign the latest member agreement first.')
  }
  if (admin && profile.orgRole !== 'admin') throw new ApiError(403, 'Only admins can do this.')
  return { token, profile }
}

export const requireAdmin = (req: Request) => requireMember(req, { admin: true })

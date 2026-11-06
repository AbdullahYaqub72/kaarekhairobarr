import type { MeResponse } from '@/types/models'

export type Destination = '/sign-in' | '/join' | '/nda' | '/status' | '/home'

/**
 * Where a person belongs right now, based on their account.
 * Every guard uses this, so the joining flow is defined in one place.
 * See docs/roles-and-workflows.md §2–3.
 */
export function destinationFor(signedIn: boolean, me: MeResponse | null): Destination {
  if (!signedIn) return '/sign-in'
  const profile = me?.profile
  if (!profile) return '/join'
  if (['rejected', 'suspended', 'alumni'].includes(profile.status)) return '/status'
  if (profile.ndaVersionSigned !== me.ndaVersion) return '/nda'
  if (profile.status === 'pending_approval') return '/status'
  return '/home'
}

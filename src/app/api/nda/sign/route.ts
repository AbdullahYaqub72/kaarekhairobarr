import { NDA } from '@/config/nda'
import { adminDb } from '@/lib/firebase/admin'
import { namesMatch, ndaSignSchema } from '@/lib/validation'
import { logAudit } from '@/server/audit'
import { requireProfile } from '@/server/auth'
import { ApiError, handle, json, nowIso, parseBody } from '@/server/http'
import { usersCol } from '@/server/users'

export const dynamic = 'force-dynamic'

/** Records the member's electronic signature on the current agreement. */
export const POST = handle(async (req) => {
  const { profile } = await requireProfile(req)
  if (!['registered', 'pending_approval', 'active'].includes(profile.status)) {
    throw new ApiError(403, 'Your account cannot sign the agreement right now.')
  }

  const input = await parseBody(req, ndaSignSchema)
  if (input.version !== NDA.version) {
    throw new ApiError(409, 'The agreement was just updated. Please reload and read the new version.')
  }
  if (!namesMatch(input.typedName, profile.fullName)) {
    throw new ApiError(400, `Type your full name exactly as on your profile: ${profile.fullName}`)
  }

  const now = nowIso()
  const signatureRef = adminDb().collection('ndaSignatures').doc(`${profile.uid}_v${NDA.version}`)
  const batch = adminDb().batch()
  batch.set(signatureRef, {
    uid: profile.uid,
    version: NDA.version,
    typedName: input.typedName.trim(),
    signedAt: now,
    userAgent: req.headers.get('user-agent')?.slice(0, 300) ?? '',
  })
  batch.update(usersCol().doc(profile.uid), {
    ndaVersionSigned: NDA.version,
    ndaSignedAt: now,
    // First signature moves a new member into the approval queue.
    ...(profile.status === 'registered' ? { status: 'pending_approval' } : {}),
    updatedAt: now,
  })
  await batch.commit()

  await logAudit(profile.uid, 'nda.signed', { type: 'user', id: profile.uid }, { version: NDA.version })
  return json({ ok: true })
})

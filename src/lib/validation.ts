import { z } from 'zod'

// Shared by the forms (client) and the API routes (server), so the rules
// can never drift apart.

const phonePattern = /^\+?[0-9][0-9\s-]{8,16}$/

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Please enter your full name.')
    .max(80, 'Name is too long.'),
  phone: z
    .string()
    .trim()
    .regex(phonePattern, 'Enter a valid WhatsApp number, e.g. 0300 1234567.'),
  department: z.string().trim().max(80, 'Too long.'),
  batch: z.string().trim().max(20, 'Too long.'),
  /** Comma-separated in the form; stored as an array. */
  skills: z.string().trim().max(200, 'Keep skills under 200 characters.'),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const joinSchema = z.object({
  code: z.string().trim().min(1, 'Enter your invite code.'),
  profile: profileSchema,
  requestedTeams: z.array(z.string()).max(10),
})

export type JoinInput = z.infer<typeof joinSchema>

export const ndaSignSchema = z.object({
  version: z.number().int().positive(),
  typedName: z.string().trim().min(3, 'Type your full name to sign.'),
  agreed: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm that you have read and agree.' }),
  }),
})

export const reasonSchema = z.object({
  reason: z.string().trim().max(500, 'Keep it under 500 characters.'),
})

export const requiredReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Please give a short reason.')
    .max(500, 'Keep it under 500 characters.'),
})

export const inviteCreateSchema = z.object({
  label: z.string().trim().max(80, 'Too long.'),
  suggestedTeams: z.array(z.string()).max(10),
  expiresInDays: z.number().int().min(1).max(30),
})

export const teamSchema = z.object({
  name: z.string().trim().min(2, 'Team name is too short.').max(40, 'Team name is too long.'),
  description: z.string().trim().max(160, 'Keep it under 160 characters.'),
})

export function splitSkills(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
        .map((skill) => skill.slice(0, 30))
    )
  ).slice(0, 10)
}

/** Invite codes are shown as ABCD-EFGH but stored without the dash. */
export function normalizeInviteCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function formatInviteCode(code: string): string {
  const clean = normalizeInviteCode(code)
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4, 8)}` : clean
}

export function namesMatch(a: string, b: string): boolean {
  const clean = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()
  return clean(a) === clean(b)
}

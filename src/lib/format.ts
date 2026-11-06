import type { InviteState, LeaveRequestStatus, TeamPosition, UserStatus } from '@/types/models'

export type Tone = 'neutral' | 'navy' | 'gold' | 'success' | 'warning' | 'danger'

export const STATUS_META: Record<UserStatus, { label: string; tone: Tone }> = {
  registered: { label: 'Needs agreement', tone: 'warning' },
  pending_approval: { label: 'Awaiting approval', tone: 'warning' },
  active: { label: 'Active', tone: 'success' },
  rejected: { label: 'Not approved', tone: 'danger' },
  suspended: { label: 'Suspended', tone: 'danger' },
  alumni: { label: 'Alumni', tone: 'neutral' },
}

export const POSITION_META: Record<TeamPosition, { label: string; tone: Tone }> = {
  lead: { label: 'Lead', tone: 'gold' },
  'co-lead': { label: 'Co-lead', tone: 'navy' },
  member: { label: 'Member', tone: 'neutral' },
}

export const INVITE_META: Record<InviteState, { label: string; tone: Tone }> = {
  active: { label: 'Active', tone: 'success' },
  used: { label: 'Used', tone: 'navy' },
  expired: { label: 'Expired', tone: 'neutral' },
  revoked: { label: 'Revoked', tone: 'danger' },
}

export const LEAVE_META: Record<LeaveRequestStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  declined: { label: 'Declined', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}

const POSITION_ORDER: Record<TeamPosition, number> = { lead: 0, 'co-lead': 1, member: 2 }

export function comparePositions(a: TeamPosition, b: TeamPosition) {
  return POSITION_ORDER[a] - POSITION_ORDER[b]
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function timeAgo(iso: string) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} d ago`
  return formatDate(iso)
}

export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}

export function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase()
}

/** Pakistani local numbers (03xx…) → wa.me international format (923xx…). */
export function whatsappLink(phone: string, text?: string) {
  let digits = phone.replace(/[^0-9]/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = `92${digits.slice(1)}`
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${digits}${query}`
}

export function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}

// Shared data shapes used by both the API routes and the UI.
// See docs/roles-and-workflows.md for what each field means.

export type OrgRole = 'admin' | 'member'

export type UserStatus =
  | 'registered'
  | 'pending_approval'
  | 'active'
  | 'rejected'
  | 'suspended'
  | 'alumni'

export type TeamPosition = 'lead' | 'co-lead' | 'member'

/** teamId → position, e.g. { events: 'lead', design: 'member' } */
export type TeamMemberships = Record<string, TeamPosition>

export interface UserProfile {
  uid: string
  email: string
  fullName: string
  phone: string
  department: string
  batch: string
  skills: string[]
  requestedTeams: string[]
  orgRole: OrgRole
  status: UserStatus
  teams: TeamMemberships
  ndaVersionSigned: number | null
  ndaSignedAt: string | null
  statusReason: string | null
  pendingLeaveRequestId: string | null
  createdAt: string
  updatedAt: string
  approvedAt: string | null
}

export interface Team {
  id: string
  name: string
  description: string
  active: boolean
  leadUid: string | null
  coLeadUid: string | null
  order: number
  createdAt: string
}

export interface TeamSummary extends Team {
  memberCount: number
  leadName: string | null
  coLeadName: string | null
  myPosition: TeamPosition | null
}

export interface RosterMember {
  uid: string
  fullName: string
  position: TeamPosition
  /** Only included for admins and the team's leads. */
  phone?: string
  email?: string
}

export type InviteState = 'active' | 'used' | 'expired' | 'revoked'

export interface InviteCode {
  code: string
  label: string
  suggestedTeams: string[]
  createdBy: string
  createdByName: string
  createdAt: string
  expiresAt: string
  usedBy: string | null
  usedByName: string | null
  usedAt: string | null
  revokedAt: string | null
  state: InviteState
}

export type LeaveRequestStatus = 'pending' | 'approved' | 'declined' | 'cancelled'

export interface LeaveRequest {
  id: string
  uid: string
  userName: string
  reason: string
  status: LeaveRequestStatus
  createdAt: string
  reviewedBy: string | null
  reviewedByName: string | null
  reviewedAt: string | null
  reviewNote: string | null
}

export interface NdaSignature {
  uid: string
  version: number
  typedName: string
  signedAt: string
  userAgent: string
}

// ── API response shapes ──

export interface MeResponse {
  user: { uid: string; email: string | null }
  profile: UserProfile | null
  ndaVersion: number
  leaveRequest: LeaveRequest | null
}

export interface InviteCheckResponse {
  code: string
  label: string
  suggestedTeams: string[]
  teams: Pick<Team, 'id' | 'name' | 'description'>[]
}

export interface TeamDetailResponse {
  team: TeamSummary
  roster: RosterMember[]
  canSeeContacts: boolean
}

export interface AdminOverview {
  pendingMembers: number
  pendingLeaveRequests: number
  activeMembers: number
  activeInvites: number
  vacantLeadTeams: string[]
}

export interface AdminMemberDetail {
  profile: UserProfile
  signature: NdaSignature | null
  leaveRequests: LeaveRequest[]
}

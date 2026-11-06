import type { Metadata } from 'next'
import { AdminTeamDetailScreen } from '@/features/admin/AdminTeamDetailScreen'

export const metadata: Metadata = { title: 'Team · Admin' }

export default function AdminTeamPage({ params }: { params: { teamId: string } }) {
  return <AdminTeamDetailScreen teamId={params.teamId} />
}

import type { Metadata } from 'next'
import { TeamDetailScreen } from '@/features/teams/TeamDetailScreen'

export const metadata: Metadata = { title: 'Team' }

export default function TeamPage({ params }: { params: { teamId: string } }) {
  return <TeamDetailScreen teamId={params.teamId} />
}

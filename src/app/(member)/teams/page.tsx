import type { Metadata } from 'next'
import { TeamsScreen } from '@/features/teams/TeamsScreen'

export const metadata: Metadata = { title: 'Teams' }

export default function TeamsPage() {
  return <TeamsScreen />
}

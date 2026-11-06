import type { Metadata } from 'next'
import { AdminTeamsScreen } from '@/features/admin/AdminTeamsScreen'

export const metadata: Metadata = { title: 'Teams · Admin' }

export default function AdminTeamsPage() {
  return <AdminTeamsScreen />
}

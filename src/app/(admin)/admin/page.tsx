import type { Metadata } from 'next'
import { AdminOverviewScreen } from '@/features/admin/AdminOverviewScreen'

export const metadata: Metadata = { title: 'Admin' }

export default function AdminPage() {
  return <AdminOverviewScreen />
}

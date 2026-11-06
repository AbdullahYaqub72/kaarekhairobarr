import type { Metadata } from 'next'
import { LeaveRequestsScreen } from '@/features/admin/LeaveRequestsScreen'

export const metadata: Metadata = { title: 'Leave requests · Admin' }

export default function AdminLeaveRequestsPage() {
  return <LeaveRequestsScreen />
}

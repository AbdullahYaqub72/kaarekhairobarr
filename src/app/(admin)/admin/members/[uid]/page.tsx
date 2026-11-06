import type { Metadata } from 'next'
import { MemberDetailScreen } from '@/features/admin/MemberDetailScreen'

export const metadata: Metadata = { title: 'Member · Admin' }

export default function AdminMemberPage({ params }: { params: { uid: string } }) {
  return <MemberDetailScreen uid={params.uid} />
}

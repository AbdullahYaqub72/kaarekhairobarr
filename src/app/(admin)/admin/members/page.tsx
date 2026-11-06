import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoadingBlock } from '@/components/ui/Spinner'
import { MembersScreen } from '@/features/admin/MembersScreen'

export const metadata: Metadata = { title: 'Members · Admin' }

export default function AdminMembersPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <MembersScreen />
    </Suspense>
  )
}

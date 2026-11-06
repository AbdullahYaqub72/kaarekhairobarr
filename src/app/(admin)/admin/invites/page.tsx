import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoadingBlock } from '@/components/ui/Spinner'
import { InvitesScreen } from '@/features/admin/InvitesScreen'

export const metadata: Metadata = { title: 'Invite codes · Admin' }

export default function AdminInvitesPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <InvitesScreen />
    </Suspense>
  )
}

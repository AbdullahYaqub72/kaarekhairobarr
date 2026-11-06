import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Splash } from '@/components/layout/Splash'
import { Gate } from '@/features/auth/Gate'
import { JoinScreen } from '@/features/onboarding/JoinScreen'

export const metadata: Metadata = { title: 'Join' }

export default function JoinPage() {
  return (
    <Gate mode="join">
      <Suspense fallback={<Splash />}>
        <JoinScreen />
      </Suspense>
    </Gate>
  )
}

import type { Metadata } from 'next'
import { Gate } from '@/features/auth/Gate'
import { StatusScreen } from '@/features/onboarding/StatusScreen'

export const metadata: Metadata = { title: 'Your membership' }

export default function StatusPage() {
  return (
    <Gate mode="status">
      <StatusScreen />
    </Gate>
  )
}

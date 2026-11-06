import type { Metadata } from 'next'
import { Gate } from '@/features/auth/Gate'
import { NdaScreen } from '@/features/onboarding/NdaScreen'

export const metadata: Metadata = { title: 'Member agreement' }

export default function NdaPage() {
  return (
    <Gate mode="nda">
      <NdaScreen />
    </Gate>
  )
}

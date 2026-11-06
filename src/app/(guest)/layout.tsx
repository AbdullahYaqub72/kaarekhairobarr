import { Gate } from '@/features/auth/Gate'

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return <Gate mode="guest">{children}</Gate>
}

import { AdminShell } from '@/components/layout/AdminShell'
import { Gate } from '@/features/auth/Gate'

// Admin area: built for tablets and laptops, must still work on a phone.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Gate mode="admin">
      <AdminShell>{children}</AdminShell>
    </Gate>
  )
}

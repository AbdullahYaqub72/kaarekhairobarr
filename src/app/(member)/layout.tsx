import { MemberShell } from '@/components/layout/MemberShell'
import { Gate } from '@/features/auth/Gate'

// Members' app: mobile-first. See CLAUDE.md > Mobile-first design.
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <Gate mode="member">
      <MemberShell>{children}</MemberShell>
    </Gate>
  )
}

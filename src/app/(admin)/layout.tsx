import type { ReactNode } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Admin pages target tablet/laptop. Same chrome as public pages for now;
// this layout is where an admin-specific shell will go.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

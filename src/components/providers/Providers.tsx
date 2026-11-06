'use client'

import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/features/auth/AuthProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgb(var(--navy))',
            color: '#ffffff',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 600,
            padding: '12px 16px',
            maxWidth: '92vw',
          },
          success: { iconTheme: { primary: '#c9a84c', secondary: 'rgb(var(--navy))' } },
          error: { style: { background: '#b42318', color: '#ffffff' } },
        }}
      />
    </AuthProvider>
  )
}

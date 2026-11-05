'use client'

import React from 'react'
import { Toaster } from 'react-hot-toast'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#143321',
            color: '#fdf9f2',
            border: '1px solid rgba(253, 249, 242, 0.12)',
            boxShadow: '0 24px 50px -30px rgba(8, 16, 15, 0.65)',
          },
          success: {
            iconTheme: {
              primary: '#d4a562',
              secondary: '#143321',
            },
          },
          error: {
            style: {
              background: '#652b1e',
              color: '#fdf9f2',
            },
          },
        }}
      />
    </>
  )
}

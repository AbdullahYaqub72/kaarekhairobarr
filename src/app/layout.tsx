import type { Metadata } from 'next'
import React, { ReactNode } from 'react'
import Providers from '@/components/providers/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kaare Khair o Barr | Relief Delivered With Dignity',
  description:
    'A community-first welfare platform for campaigns, volunteer action, and support requests powered by Kaare Khair o Barr.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

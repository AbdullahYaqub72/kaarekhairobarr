import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import { BRAND_NAME } from '@/config/brand'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  title: { default: `${BRAND_NAME} | Members`, template: `%s | KKB` },
  description: 'The members app for Kaar e Khair o Barr, a UET Lahore welfare initiative.',
  applicationName: 'KKB Members',
  appleWebApp: { capable: true, title: 'KKB', statusBarStyle: 'black-translucent' },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Browser/status bar colour: matches the navy header band in each theme.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0f2a5e' },
    { media: '(prefers-color-scheme: dark)', color: '#1c3a7a' },
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

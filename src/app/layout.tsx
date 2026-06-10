import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MOU Generator — PT Eka Jaya Internasional',
  description: 'Internal tool for generating KOL collaboration MOU documents',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}

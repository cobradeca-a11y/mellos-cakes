import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'MellosCakes', template: '%s | MellosCakes' },
  description: 'Sistema de gestão para confeitaria profissional',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}

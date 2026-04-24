import type { Metadata } from 'next'
import '@/styles/globals.css'
import { ThemeScript } from '@/components/ui/ThemeScript'

export const metadata: Metadata = {
  title: { default: 'MellosCakes', template: '%s | MellosCakes' },
  description: 'Sistema de gestão para confeitaria profissional',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  )
}

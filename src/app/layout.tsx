import type { Metadata } from 'next'
import '@/styles/globals.css'
<<<<<<< HEAD
=======
import { ThemeScript } from '@/components/ui/ThemeScript'
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0

export const metadata: Metadata = {
  title: { default: 'MellosCakes', template: '%s | MellosCakes' },
  description: 'Sistema de gestão para confeitaria profissional',
<<<<<<< HEAD
  icons: { icon: '/favicon.ico' },
=======
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
<<<<<<< HEAD
=======
      <head>
        <ThemeScript />
      </head>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
      <body>{children}</body>
    </html>
  )
}

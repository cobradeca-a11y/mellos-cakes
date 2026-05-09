import { Cookie } from 'lucide-react'
<<<<<<< HEAD

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-rose-50 flex items-center justify-center p-4">
=======
import { ThemeScript } from '@/components/ui/ThemeScript'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors"
      style={{ background: 'var(--bg)' }}>

      {/* Toggle modo escuro no canto superior direito */}
      <div className="fixed top-4 right-4">
        <div className="p-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <ThemeToggle />
        </div>
      </div>

>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg">
            <Cookie className="w-5 h-5 text-white" />
          </div>
          <div>
<<<<<<< HEAD
            <span className="font-display text-2xl font-semibold text-neutral-900">Mellos</span>
=======
            <span className="font-display text-2xl font-semibold" style={{ color: 'var(--text-1)' }}>Mellos</span>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            <span className="font-display text-2xl font-semibold text-brand-500">Cakes</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

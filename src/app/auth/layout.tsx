import { Cookie } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg">
            <Cookie className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display text-2xl font-semibold text-neutral-900">Mellos</span>
            <span className="font-display text-2xl font-semibold text-brand-500">Cakes</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

'use client'

import { Search, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { NotificationBell } from '@/components/ui/NotificationBell'

export function Topbar() {
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 h-14"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Spacer for mobile hamburger */}
      <div className="w-10 md:hidden shrink-0" />

      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            style={{ background: 'var(--hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <NotificationBell />
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="p-2 rounded-xl transition-colors hover:bg-[var(--hover)]"
          title="Sair"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

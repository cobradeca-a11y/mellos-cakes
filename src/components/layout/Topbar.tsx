'use client'

import { Search, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { NotificationBell } from '@/components/ui/NotificationBell'

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 h-14 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
      {title && (
        <h1 className="font-display font-semibold text-neutral-900 text-lg">{title}</h1>
      )}

      <div className="flex-1 max-w-sm ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-neutral-100 border-0 rounded-xl placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <NotificationBell />

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="p-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-900"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck, AlertTriangle, ShoppingBag, Package, CalendarDays, DollarSign } from 'lucide-react'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const typeIcon: Record<string, any> = {
  estoque_baixo: Package,
  pedido_proximo: CalendarDays,
  orcamento: ShoppingBag,
  financeiro: DollarSign,
  default: AlertTriangle,
}

export function NotificationBell() {
  const { notifications, unread, markAllRead, markRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-900"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-modal border border-neutral-100 z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-900">Notificações</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" /> Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-neutral-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Sem notificações
              </div>
            ) : (
              notifications.map(n => {
                const Icon = typeIcon[n.type] ?? typeIcon.default
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'flex gap-3 px-4 py-3 hover:bg-neutral-50 cursor-pointer transition-colors',
                      !n.read && 'bg-brand-50/50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                      n.read ? 'bg-neutral-100' : 'bg-brand-100'
                    )}>
                      <Icon className={cn('w-4 h-4', n.read ? 'text-neutral-500' : 'text-brand-500')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', n.read ? 'text-neutral-700' : 'text-neutral-900')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.message}</p>
                      {n.link && (
                        <Link href={n.link} className="text-xs text-brand-500 hover:underline mt-1 inline-block">
                          Ver →
                        </Link>
                      )}
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-brand-500 rounded-full mt-2 shrink-0" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

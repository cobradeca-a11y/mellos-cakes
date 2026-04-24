import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export async function AlertaEntrega() {
  const supabase = createClient()
  const now = new Date()
  const em72h = new Date(now.getTime() + 72 * 60 * 60 * 1000)

  const { data: pedidos } = await supabase
    .from('orders')
    .select('id, order_number, delivery_date, status, customers(name)')
    .in('status', ['confirmado', 'em_producao'])
    .gte('delivery_date', now.toISOString())
    .lte('delivery_date', em72h.toISOString())
    .order('delivery_date', { ascending: true })

  if (!pedidos || pedidos.length === 0) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(234,179,8,0.4)', background: 'rgba(234,179,8,0.06)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(234,179,8,0.2)' }}>
        <div className="w-8 h-8 rounded-xl bg-yellow-400/20 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        </div>
        <div>
          <p className="font-semibold text-yellow-700 dark:text-yellow-400">
            {pedidos.length === 1
              ? '1 pedido entrega em menos de 72h'
              : `${pedidos.length} pedidos entregam em menos de 72h`}
          </p>
          <p className="text-xs text-yellow-600/70 dark:text-yellow-500/70">Atenção à produção</p>
        </div>
      </div>

      {/* Pedidos */}
      <div className="divide-y divide-yellow-200/30 dark:divide-yellow-900/30">
        {pedidos.map((p: any) => {
          const entrega = new Date(p.delivery_date)
          const diffMs = entrega.getTime() - now.getTime()
          const diffH = Math.floor(diffMs / (1000 * 60 * 60))
          const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

          const urgente = diffH < 24
          const cor = urgente ? 'text-red-500' : 'text-yellow-600 dark:text-yellow-400'

          return (
            <Link
              key={p.id}
              href={`/pedidos/${p.id}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-yellow-400/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${urgente ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'}`} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
                    {(p.customers as any)?.name ?? 'Cliente'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    Pedido #{p.order_number} • {p.status.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${cor}`}>
                  {diffH > 0 ? `${diffH}h ${diffMin}min` : `${diffMin} minutos`}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {formatDateTime(p.delivery_date)}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

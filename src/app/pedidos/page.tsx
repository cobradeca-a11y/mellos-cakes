import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, ClipboardList, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Pedidos' }

const STATUS_OPTS = [
  { value:'', label:'Todos' },
  { value:'confirmado', label:'Confirmado' },
  { value:'em_producao', label:'Em Produção' },
  { value:'finalizado', label:'Finalizado' },
  { value:'entregue', label:'Entregue' },
  { value:'cancelado', label:'Cancelado' },
]
const statusBadge: Record<string,string> = {
  orcamento:'badge-gray', confirmado:'badge-blue', em_producao:'badge-yellow',
  finalizado:'badge-green', entregue:'badge-gray', cancelado:'badge-red',
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string }
}) {
  const supabase = createClient()
  const q       = searchParams.q ?? ''
  const status  = searchParams.status ?? ''
  const page    = Number(searchParams.page ?? 1)
  const pageSize = 20
  const now     = new Date()
  const em72h   = new Date(now.getTime() + 72 * 60 * 60 * 1000)

  let query = supabase
    .from('orders')
    .select('*, customers(name)', { count:'exact' })
    .order('delivery_date', { ascending:true })
    .range((page-1)*pageSize, page*pageSize-1)

  if (status) query = query.eq('status', status)
  if (q)      query = query.ilike('order_number', `%${q}%`)

  const { data: orders, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  // Identificar quais pedidos estão com 72h ou menos
  const urgentIds = new Set(
    (orders ?? [])
      .filter((o: any) => {
        const d = new Date(o.delivery_date)
        return d >= now && d <= em72h && !['entregue','cancelado','finalizado'].includes(o.status)
      })
      .map((o: any) => o.id)
  )

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--muted)' }}>{count ?? 0} pedidos</p>
        </div>
        <Link href="/pedidos/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Pedido
        </Link>
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <form className="flex flex-wrap gap-3">
          <input name="q" defaultValue={q} placeholder="Buscar por número..." className="input flex-1 min-w-40" />
          <select name="status" defaultValue={status} className="input w-auto min-w-40">
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="submit" className="btn-primary">Filtrar</button>
        </form>
      </div>

      {/* Tabela desktop */}
      <div className="table-container hidden md:block">
        <table className="table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Entrega</th>
              <th>Status</th>
              <th>Total</th>
              <th>Saldo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12" style={{ color:'var(--muted)' }}>
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum pedido encontrado</p>
                </td>
              </tr>
            ) : (
              (orders ?? []).map((o: any) => {
                const urgente = urgentIds.has(o.id)
                const diffH = urgente ? Math.floor((new Date(o.delivery_date).getTime() - now.getTime()) / (1000*60*60)) : null
                return (
                  <tr key={o.id} style={urgente ? { background:'rgba(234,179,8,0.06)' } : {}}>
                    <td>
                      <div className="flex items-center gap-2">
                        {urgente && <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />}
                        <span className="font-mono text-sm font-medium" style={{ color:'var(--text-1)' }}>
                          #{o.order_number}
                        </span>
                      </div>
                    </td>
                    <td className="font-medium" style={{ color:'var(--text-1)' }}>
                      {(o.customers as any)?.name ?? '—'}
                    </td>
                    <td>
                      <div>
                        <p>{formatDate(o.delivery_date)}</p>
                        {urgente && (
                          <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                            ⚠ {diffH}h restantes
                          </p>
                        )}
                      </div>
                    </td>
                    <td><span className={statusBadge[o.status] ?? 'badge-gray'}>{o.status.replace('_',' ')}</span></td>
                    <td className="font-semibold" style={{ color:'var(--text-1)' }}>{formatCurrency(o.total_amount)}</td>
                    <td>
                      {o.balance_due > 0
                        ? <span className="badge-red">{formatCurrency(o.balance_due)}</span>
                        : <span className="badge-green">Pago</span>}
                    </td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        <Link href={`/pedidos/${o.id}`} className="btn-ghost text-xs py-1 px-2">Ver</Link>
                        <Link href={`/pedidos/${o.id}/editar`} className="btn-ghost text-xs py-1 px-2">Editar</Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop:'1px solid var(--border)' }}>
            <p className="text-sm" style={{ color:'var(--muted)' }}>Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`?q=${q}&status=${status}&page=${page-1}`} className="btn-secondary text-xs">← Anterior</Link>}
              {page < totalPages && <Link href={`?q=${q}&status=${status}&page=${page+1}`} className="btn-secondary text-xs">Próxima →</Link>}
            </div>
          </div>
        )}
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-3">
        {(orders ?? []).map((o: any) => {
          const urgente = urgentIds.has(o.id)
          const diffH = urgente ? Math.floor((new Date(o.delivery_date).getTime() - now.getTime()) / (1000*60*60)) : null
          return (
            <Link key={o.id} href={`/pedidos/${o.id}`}
              className="card block p-4 space-y-3"
              style={urgente ? { borderColor:'rgba(234,179,8,0.5)', background:'rgba(234,179,8,0.04)' } : {}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {urgente && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                  <span className="font-mono font-semibold text-sm" style={{ color:'var(--text-1)' }}>#{o.order_number}</span>
                </div>
                <span className={statusBadge[o.status] ?? 'badge-gray'}>{o.status.replace('_',' ')}</span>
              </div>
              <p className="font-medium" style={{ color:'var(--text-1)' }}>{(o.customers as any)?.name ?? '—'}</p>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p style={{ color:'var(--text-3)' }}>{formatDate(o.delivery_date)}</p>
                  {urgente && <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">⚠ {diffH}h restantes</p>}
                </div>
                <p className="font-bold" style={{ color:'var(--text-1)' }}>{formatCurrency(o.total_amount)}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

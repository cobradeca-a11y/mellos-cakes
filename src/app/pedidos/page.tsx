import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
<<<<<<< HEAD
import { Plus, ClipboardList, Search } from 'lucide-react'
=======
import { Plus, ClipboardList, AlertTriangle } from 'lucide-react'
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
import Link from 'next/link'

export const metadata = { title: 'Pedidos' }

const STATUS_OPTS = [
<<<<<<< HEAD
  { value: '', label: 'Todos' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'em_producao', label: 'Em Produção' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
]

const statusBadge: Record<string, string> = {
  orcamento: 'badge-gray',
  confirmado: 'badge-blue',
  em_producao: 'badge-yellow',
  finalizado: 'badge-green',
  entregue: 'badge bg-purple-100 text-purple-700',
  cancelado: 'badge-red',
=======
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
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string }
}) {
  const supabase = createClient()
<<<<<<< HEAD
  const q = searchParams.q ?? ''
  const status = searchParams.status ?? ''
  const page = Number(searchParams.page ?? 1)
  const pageSize = 20

  let query = supabase
    .from('orders')
    .select('*, customers(name)', { count: 'exact' })
    .order('delivery_date', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (status) query = query.eq('status', status)
  if (q) query = query.ilike('order_number', `%${q}%`)
=======
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
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0

  const { data: orders, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

<<<<<<< HEAD
=======
  // Identificar quais pedidos estão com 72h ou menos
  const urgentIds = new Set(
    (orders ?? [])
      .filter((o: any) => {
        const d = new Date(o.delivery_date)
        return d >= now && d <= em72h && !['entregue','cancelado','finalizado'].includes(o.status)
      })
      .map((o: any) => o.id)
  )

>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
<<<<<<< HEAD
          <p className="text-sm text-neutral-500 mt-0.5">{count ?? 0} pedidos encontrados</p>
=======
          <p className="text-sm mt-0.5" style={{ color:'var(--muted)' }}>{count ?? 0} pedidos</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
        </div>
        <Link href="/pedidos/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Pedido
        </Link>
      </div>

<<<<<<< HEAD
      {/* Filters */}
      <div className="card p-4">
        <form className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input name="q" defaultValue={q} placeholder="Buscar por número..." className="input pl-9" />
          </div>
=======
      {/* Filtros */}
      <div className="card p-4">
        <form className="flex flex-wrap gap-3">
          <input name="q" defaultValue={q} placeholder="Buscar por número..." className="input flex-1 min-w-40" />
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
          <select name="status" defaultValue={status} className="input w-auto min-w-40">
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="submit" className="btn-primary">Filtrar</button>
        </form>
      </div>

<<<<<<< HEAD
      {/* Table */}
      <div className="table-container">
=======
      {/* Tabela desktop */}
      <div className="table-container hidden md:block">
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
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
<<<<<<< HEAD
                <td colSpan={7} className="text-center py-12 text-neutral-400">
=======
                <td colSpan={7} className="text-center py-12" style={{ color:'var(--muted)' }}>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum pedido encontrado</p>
                </td>
              </tr>
            ) : (
<<<<<<< HEAD
              (orders ?? []).map((o: any) => (
                <tr key={o.id}>
                  <td>
                    <span className="font-mono text-sm font-medium text-neutral-800">#{o.order_number}</span>
                  </td>
                  <td className="font-medium text-neutral-900">{o.customers?.name ?? '—'}</td>
                  <td>{formatDate(o.delivery_date)}</td>
                  <td><span className={statusBadge[o.status] ?? 'badge-gray'}>{o.status.replace('_', ' ')}</span></td>
                  <td className="font-semibold">{formatCurrency(o.total_amount)}</td>
                  <td>
                    {o.balance_due > 0 ? (
                      <span className="badge-red">{formatCurrency(o.balance_due)}</span>
                    ) : (
                      <span className="badge-green">Pago</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2 justify-end">
                      <Link href={`/pedidos/${o.id}`} className="btn-ghost text-xs py-1 px-2">Ver</Link>
                      <Link href={`/pedidos/${o.id}/editar`} className="btn-ghost text-xs py-1 px-2">Editar</Link>
                    </div>
                  </td>
                </tr>
              ))
=======
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
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
<<<<<<< HEAD
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
            <p className="text-sm text-neutral-500">Página {page} de {totalPages}</p>
=======
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop:'1px solid var(--border)' }}>
            <p className="text-sm" style={{ color:'var(--muted)' }}>Página {page} de {totalPages}</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            <div className="flex gap-2">
              {page > 1 && <Link href={`?q=${q}&status=${status}&page=${page-1}`} className="btn-secondary text-xs">← Anterior</Link>}
              {page < totalPages && <Link href={`?q=${q}&status=${status}&page=${page+1}`} className="btn-secondary text-xs">Próxima →</Link>}
            </div>
          </div>
        )}
      </div>
<<<<<<< HEAD
=======

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
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
    </div>
  )
}

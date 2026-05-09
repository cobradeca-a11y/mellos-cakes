import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, ClipboardList, Search } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Pedidos' }

const STATUS_OPTS = [
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
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string }
}) {
  const supabase = createClient()
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

  const { data: orders, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{count ?? 0} pedidos encontrados</p>
        </div>
        <Link href="/pedidos/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Pedido
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input name="q" defaultValue={q} placeholder="Buscar por número..." className="input pl-9" />
          </div>
          <select name="status" defaultValue={status} className="input w-auto min-w-40">
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="submit" className="btn-primary">Filtrar</button>
        </form>
      </div>

      {/* Table */}
      <div className="table-container">
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
                <td colSpan={7} className="text-center py-12 text-neutral-400">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum pedido encontrado</p>
                </td>
              </tr>
            ) : (
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
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
            <p className="text-sm text-neutral-500">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`?q=${q}&status=${status}&page=${page-1}`} className="btn-secondary text-xs">← Anterior</Link>}
              {page < totalPages && <Link href={`?q=${q}&status=${status}&page=${page+1}`} className="btn-secondary text-xs">Próxima →</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

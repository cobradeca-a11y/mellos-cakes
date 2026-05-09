import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Compras' }

const statusBadge: Record<string, string> = {
  pendente: 'badge-yellow',
  confirmado: 'badge-blue',
  recebido: 'badge-green',
  cancelado: 'badge-red',
}

export default async function ComprasPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = createClient()
  const status = searchParams.status ?? ''

  let query = supabase
    .from('purchase_orders')
    .select('*, suppliers(name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: orders, count } = await query

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos de Compra</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">{count ?? 0} pedidos</p>
        </div>
        <Link href="/compras/nova" className="btn-primary">
          <Plus className="w-4 h-4" /> Nova Compra
        </Link>
      </div>

      <div className="card p-4">
        <form className="flex gap-3">
          <select name="status" defaultValue={status} className="input w-auto">
            <option value="">Todos</option>
            {['pendente','confirmado','recebido','cancelado'].map(s =>
              <option key={s} value={s}>{s}</option>
            )}
          </select>
          <button type="submit" className="btn-primary">Filtrar</button>
        </form>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Fornecedor</th><th>Status</th><th>Previsão Entrega</th><th>Total</th><th>Criado em</th><th></th></tr>
          </thead>
          <tbody>
            {(orders ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[var(--muted)]">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum pedido de compra</p>
                </td>
              </tr>
            ) : (
              (orders ?? []).map((o: any) => (
                <tr key={o.id}>
                  <td className="font-medium text-[var(--text-1)]">{o.suppliers?.name ?? '—'}</td>
                  <td><span className={statusBadge[o.status] ?? 'badge-gray'}>{o.status}</span></td>
                  <td>{o.expected_delivery ? formatDate(o.expected_delivery) : '—'}</td>
                  <td className="font-semibold">{formatCurrency(o.total_amount)}</td>
                  <td className="text-[var(--muted)] text-xs">{formatDate(o.created_at)}</td>
                  <td>
                    <div className="flex gap-2 justify-end">
                      <Link href={`/compras/${o.id}`} className="btn-ghost text-xs py-1 px-2">Ver</Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

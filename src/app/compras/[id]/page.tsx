import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { updatePurchaseOrderStatus } from '../actions'

export default async function CompraDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: order } = await supabase
    .from('purchase_orders')
    .select('*, suppliers(name), purchase_order_items(*, ingredients(name, unit))')
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const canReceive = order.status === 'pendente' || order.status === 'confirmado'
  const receiveAction = updatePurchaseOrderStatus.bind(null, params.id, 'recebido')

  const statusBadge: Record<string,string> = {
    pendente:'badge-yellow',confirmado:'badge-blue',recebido:'badge-green',cancelado:'badge-red'
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/compras" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="page-title">Pedido de Compra</h1>
<<<<<<< HEAD
            <p className="text-sm text-neutral-500">{(order.suppliers as any)?.name ?? '—'}</p>
=======
            <p className="text-sm text-[var(--text-3)]">{(order.suppliers as any)?.name ?? '—'}</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
          </div>
        </div>
        {canReceive && (
          <form action={receiveAction}>
            <button type="submit" className="btn-primary">
              <CheckCircle className="w-4 h-4" /> Confirmar Recebimento
            </button>
          </form>
        )}
      </div>

      <div className="card p-5 grid grid-cols-3 gap-4 text-sm">
        <div>
<<<<<<< HEAD
          <p className="text-xs text-neutral-500 mb-1">Status</p>
          <span className={statusBadge[order.status] ?? 'badge-gray'}>{order.status}</span>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-1">Previsão</p>
          <p className="font-medium">{order.expected_delivery ? formatDate(order.expected_delivery) : '—'}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-1">Total</p>
=======
          <p className="text-xs text-[var(--text-3)] mb-1">Status</p>
          <span className={statusBadge[order.status] ?? 'badge-gray'}>{order.status}</span>
        </div>
        <div>
          <p className="text-xs text-[var(--text-3)] mb-1">Previsão</p>
          <p className="font-medium">{order.expected_delivery ? formatDate(order.expected_delivery) : '—'}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-3)] mb-1">Total</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
          <p className="font-bold text-brand-500">{formatCurrency(order.total_amount)}</p>
        </div>
      </div>

      <div className="table-container">
<<<<<<< HEAD
        <div className="px-5 py-4 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-800">Itens do Pedido</h3>
=======
        <div className="px-5 py-4 border-b border-[var(--border-light)]">
          <h3 className="font-semibold text-[var(--text-1)]">Itens do Pedido</h3>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
        </div>
        <table className="table">
          <thead>
            <tr><th>Ingrediente</th><th>Qtd.</th><th>Preço/Un.</th><th>Total</th></tr>
          </thead>
          <tbody>
            {(order.purchase_order_items ?? []).map((item: any) => (
              <tr key={item.id}>
<<<<<<< HEAD
                <td className="font-medium text-neutral-900">{item.ingredients?.name ?? '—'}</td>
=======
                <td className="font-medium text-[var(--text-1)]">{item.ingredients?.name ?? '—'}</td>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
                <td className="font-mono text-sm">{item.quantity} {item.ingredients?.unit}</td>
                <td>{formatCurrency(item.unit_price)}</td>
                <td className="font-semibold">{formatCurrency(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
<<<<<<< HEAD
            <tr className="bg-neutral-50">
              <td colSpan={3} className="px-4 py-3 font-semibold text-neutral-700">Total</td>
              <td className="px-4 py-3 font-bold text-neutral-900">{formatCurrency(order.total_amount)}</td>
=======
            <tr className="bg-[var(--hover)]">
              <td colSpan={3} className="px-4 py-3 font-semibold text-[var(--text-2)]">Total</td>
              <td className="px-4 py-3 font-bold text-[var(--text-1)]">{formatCurrency(order.total_amount)}</td>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            </tr>
          </tfoot>
        </table>
      </div>

      {order.notes && (
        <div className="card p-5">
<<<<<<< HEAD
          <p className="text-xs text-neutral-500 mb-1">Observações</p>
          <p className="text-sm text-neutral-700">{order.notes}</p>
=======
          <p className="text-xs text-[var(--text-3)] mb-1">Observações</p>
          <p className="text-sm text-[var(--text-2)]">{order.notes}</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
        </div>
      )}
    </div>
  )
}

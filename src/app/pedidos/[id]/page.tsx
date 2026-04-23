import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Calendar, DollarSign, User, CheckCircle } from 'lucide-react'
import { updateOrderStatus } from '../actions'

const statusFlow = ['orcamento','confirmado','em_producao','finalizado','entregue']
const statusLabel: Record<string,string> = {
  orcamento:'Orçamento',confirmado:'Confirmado',em_producao:'Em Produção',
  finalizado:'Finalizado',entregue:'Entregue',cancelado:'Cancelado'
}

export default async function PedidoDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, customers(name, phone, email)')
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const nextStatus = statusFlow[statusFlow.indexOf(order.status) + 1]
  const advanceAction = nextStatus ? updateOrderStatus.bind(null, params.id, nextStatus) : null

  const margin = order.estimated_cost > 0
    ? ((order.total_amount - order.estimated_cost) / order.total_amount * 100).toFixed(1)
    : null

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pedidos" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="page-title font-mono">#{order.order_number}</h1>
            <p className="text-sm text-neutral-500">{order.customers?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {advanceAction && (
            <form action={advanceAction}>
              <button type="submit" className="btn-primary">
                <CheckCircle className="w-4 h-4" />
                Avançar para {statusLabel[nextStatus]}
              </button>
            </form>
          )}
          <Link href={`/pedidos/${params.id}/editar`} className="btn-secondary">
            <Edit2 className="w-4 h-4" /> Editar
          </Link>
        </div>
      </div>

      {/* Status & Dates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-neutral-500 mb-1">Status</p>
          <span className={`status-${order.status} text-sm`}>{statusLabel[order.status]}</span>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 mb-1">Entrega</p>
          <p className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            {formatDateTime(order.delivery_date)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 mb-1">Total</p>
          <p className="text-sm font-bold text-neutral-900">{formatCurrency(order.total_amount)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500 mb-1">Saldo Pendente</p>
          <p className={`text-sm font-bold ${order.balance_due > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {order.balance_due > 0 ? formatCurrency(order.balance_due) : 'Pago ✓'}
          </p>
        </div>
      </div>

      {/* Financial breakdown */}
      <div className="card p-5">
        <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-neutral-400" /> Financeiro
        </h3>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Valor Total', value: formatCurrency(order.total_amount), bold: true },
            { label: 'Sinal Pago', value: formatCurrency(order.deposit_paid) },
            { label: 'Saldo Pendente', value: formatCurrency(order.balance_due), red: order.balance_due > 0 },
            { label: 'Custo Estimado', value: order.estimated_cost ? formatCurrency(order.estimated_cost) : '—' },
            { label: 'Forma de Pagamento', value: order.payment_method?.replace('_',' ') ?? '—' },
            ...(margin ? [{ label: 'Margem Bruta', value: `${margin}%`, green: true }] : []),
          ].map(r => (
            <div key={r.label} className="flex justify-between py-1.5 border-b border-neutral-50 last:border-0">
              <span className="text-neutral-500">{r.label}</span>
              <span className={`font-medium ${r.bold ? 'text-neutral-900' : r.red ? 'text-red-500' : (r as any).green ? 'text-green-600' : 'text-neutral-700'}`}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Client */}
      {order.customers && (
        <div className="card p-5">
          <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-neutral-400" /> Cliente
          </h3>
          <p className="font-medium text-neutral-900">{order.customers.name}</p>
          {order.customers.phone && <p className="text-sm text-neutral-500">{order.customers.phone}</p>}
          {order.customers.email && <p className="text-sm text-neutral-500">{order.customers.email}</p>}
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="card p-5">
          <h3 className="font-semibold text-neutral-800 mb-2">Observações</h3>
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}
    </div>
  )
}

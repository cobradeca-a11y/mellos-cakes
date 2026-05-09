import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Calendar, Edit2, ClipboardList, ShoppingBag } from 'lucide-react'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('customers').select('id, name').eq('id', params.id).single()
  return { title: (data as any)?.name ?? 'Cliente' }
}

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: customer }, { data: orders }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', params.id).single(),
    supabase
      .from('orders')
      .select('id, order_number, status, total_amount, delivery_date')
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (!customer) notFound()

  const totalSpent = (orders ?? []).reduce((s, o) => s + o.total_amount, 0)

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/clientes" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="page-title">{customer.name}</h1>
        </div>
        <Link href={`/clientes/${params.id}/editar`} className="btn-secondary">
          <Edit2 className="w-4 h-4" /> Editar
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total de Pedidos', value: String(orders?.length ?? 0), icon: ShoppingBag },
          { label: 'Total Gasto', value: formatCurrency(totalSpent), icon: ClipboardList },
          { label: 'Ticket Médio', value: orders?.length ? formatCurrency(totalSpent / orders.length) : '—', icon: ClipboardList },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
<<<<<<< HEAD
            <p className="text-2xl font-display font-semibold text-neutral-900">{s.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
=======
            <p className="text-2xl font-display font-semibold text-[var(--text-1)]">{s.value}</p>
            <p className="text-xs text-[var(--text-3)] mt-1">{s.label}</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="card p-5 space-y-3">
<<<<<<< HEAD
        <h3 className="font-semibold text-neutral-800">Informações de Contato</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {customer.phone && (
            <div className="flex items-center gap-2 text-neutral-700">
              <Phone className="w-4 h-4 text-neutral-400" />
=======
        <h3 className="font-semibold text-[var(--text-1)]">Informações de Contato</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {customer.phone && (
            <div className="flex items-center gap-2 text-[var(--text-2)]">
              <Phone className="w-4 h-4 text-[var(--muted)]" />
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
              <a href={`tel:${customer.phone}`} className="hover:text-brand-500">{customer.phone}</a>
            </div>
          )}
          {customer.email && (
<<<<<<< HEAD
            <div className="flex items-center gap-2 text-neutral-700">
              <Mail className="w-4 h-4 text-neutral-400" />
=======
            <div className="flex items-center gap-2 text-[var(--text-2)]">
              <Mail className="w-4 h-4 text-[var(--muted)]" />
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
              <a href={`mailto:${customer.email}`} className="hover:text-brand-500">{customer.email}</a>
            </div>
          )}
          {customer.birthdate && (
<<<<<<< HEAD
            <div className="flex items-center gap-2 text-neutral-700">
              <Calendar className="w-4 h-4 text-neutral-400" />
=======
            <div className="flex items-center gap-2 text-[var(--text-2)]">
              <Calendar className="w-4 h-4 text-[var(--muted)]" />
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
              {formatDate(customer.birthdate)}
            </div>
          )}
        </div>
        {customer.preferences && (
          <div>
<<<<<<< HEAD
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-1">Preferências</p>
            <p className="text-sm text-neutral-700">{customer.preferences}</p>
=======
            <p className="text-xs text-[var(--text-3)] uppercase tracking-wider font-medium mb-1">Preferências</p>
            <p className="text-sm text-[var(--text-2)]">{customer.preferences}</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
          </div>
        )}
        {customer.restrictions && (
          <div>
<<<<<<< HEAD
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-1">Restrições</p>
=======
            <p className="text-xs text-[var(--text-3)] uppercase tracking-wider font-medium mb-1">Restrições</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            <p className="text-sm text-red-600">{customer.restrictions}</p>
          </div>
        )}
        {customer.notes && (
          <div>
<<<<<<< HEAD
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-1">Observações</p>
            <p className="text-sm text-neutral-700">{customer.notes}</p>
=======
            <p className="text-xs text-[var(--text-3)] uppercase tracking-wider font-medium mb-1">Observações</p>
            <p className="text-sm text-[var(--text-2)]">{customer.notes}</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="table-container">
<<<<<<< HEAD
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-800">Histórico de Pedidos</h3>
=======
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
          <h3 className="font-semibold text-[var(--text-1)]">Histórico de Pedidos</h3>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
          <Link href={`/pedidos/novo?cliente=${params.id}`} className="btn-primary text-xs py-1.5 px-3">
            + Novo Pedido
          </Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Entrega</th>
              <th>Status</th>
              <th>Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).length === 0 ? (
<<<<<<< HEAD
              <tr><td colSpan={5} className="text-center py-8 text-neutral-400">Nenhum pedido</td></tr>
=======
              <tr><td colSpan={5} className="text-center py-8 text-[var(--muted)]">Nenhum pedido</td></tr>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            ) : (
              (orders ?? []).map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-sm">#{o.order_number}</td>
                  <td>{formatDate(o.delivery_date)}</td>
                  <td><span className={`status-${o.status}`}>{o.status.replace('_',' ')}</span></td>
                  <td className="font-semibold">{formatCurrency(o.total_amount)}</td>
                  <td><Link href={`/pedidos/${o.id}`} className="btn-ghost text-xs py-1 px-2">Ver</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

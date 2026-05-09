import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Truck, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Entregas' }

const statusBadge: Record<string, string> = {
  pendente: 'badge-yellow',
  em_rota: 'badge-blue',
  entregue: 'badge-green',
  cancelado: 'badge-red',
}

export default async function EntregasPage({ searchParams }: { searchParams: { status?: string; data?: string } }) {
  const supabase = createClient()
  const status = searchParams.status ?? ''
  const dataFiltro = searchParams.data ?? ''

  let query = supabase
    .from('deliveries')
    .select('*, orders(order_number, total_amount, customers(name, phone))', { count: 'exact' })
    .order('scheduled_at', { ascending: true })

  if (status) query = query.eq('status', status)
  if (dataFiltro) {
    query = query
      .gte('scheduled_at', `${dataFiltro}T00:00:00`)
      .lte('scheduled_at', `${dataFiltro}T23:59:59`)
  }

  const { data: deliveries, count } = await query

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Entregas</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">{count ?? 0} entregas</p>
        </div>
      </div>

      <div className="card p-4">
        <form className="flex flex-wrap gap-3">
          <input type="date" name="data" defaultValue={dataFiltro} className="input w-auto" />
          <select name="status" defaultValue={status} className="input w-auto">
            <option value="">Todos os Status</option>
            {['pendente','em_rota','entregue','cancelado'].map(s =>
              <option key={s} value={s}>{s.replace('_',' ')}</option>
            )}
          </select>
          <button type="submit" className="btn-primary">Filtrar</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(deliveries ?? []).length === 0 ? (
          <div className="col-span-2 card p-12 text-center text-[var(--muted)]">
            <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhuma entrega encontrada</p>
          </div>
        ) : (
          (deliveries ?? []).map((d: any) => (
            <div key={d.id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`badge ${d.type === 'retirada' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {d.type === 'retirada' ? '🏪 Retirada' : '🚚 Entrega'}
                </span>
                <span className={statusBadge[d.status] ?? 'badge-gray'}>{d.status.replace('_',' ')}</span>
              </div>

              <div>
                <p className="font-semibold text-[var(--text-1)]">{d.orders?.customers?.name ?? '—'}</p>
                <Link href={`/pedidos/${d.order_id}`} className="text-sm text-brand-500 font-mono hover:underline">
                  #{d.orders?.order_number}
                </Link>
              </div>

              <div className="space-y-1.5 text-sm text-[var(--text-3)]">
                {d.scheduled_at && (
                  <p className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[var(--muted)]" />
                    {formatDateTime(d.scheduled_at)}
                  </p>
                )}
                {d.contact_phone && (
                  <a href={`tel:${d.contact_phone}`} className="flex items-center gap-2 hover:text-brand-500">
                    <Phone className="w-4 h-4 text-[var(--muted)]" /> {d.contact_phone}
                  </a>
                )}
                {d.address && (
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[var(--muted)] mt-0.5 shrink-0" />
                    <span>{typeof d.address === 'string' ? d.address : JSON.stringify(d.address)}</span>
                  </p>
                )}
                {d.delivery_fee > 0 && (
                  <p className="text-xs text-[var(--muted)]">Taxa: R$ {d.delivery_fee.toFixed(2)}</p>
                )}
              </div>

              {d.status === 'pendente' && (
                <DeliveryStatusForm deliveryId={d.id} nextStatus="em_rota" label="Saiu para Entrega" />
              )}
              {d.status === 'em_rota' && (
                <DeliveryStatusForm deliveryId={d.id} nextStatus="entregue" label="Confirmar Entrega" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function DeliveryStatusForm({ deliveryId, nextStatus, label }: { deliveryId: string; nextStatus: string; label: string }) {
  async function advance() {
    'use server'
    const { createClient } = await import('@/lib/supabase/server')
    const { revalidatePath } = await import('next/cache')
    const supabase = createClient()
    await supabase.from('deliveries').update({ status: nextStatus }).eq('id', deliveryId)
    revalidatePath('/entregas')
  }
  return (
    <form action={advance}>
      <button type="submit" className="btn-primary w-full justify-center text-sm">
        {label}
      </button>
    </form>
  )
}

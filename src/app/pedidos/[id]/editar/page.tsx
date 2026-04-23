import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateOrder } from '../../actions'
import { OrderForm } from '../../OrderForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditarPedidoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [{ data: order }, { data: customers }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', params.id).single(),
    supabase.from('customers').select('id, name').eq('active', true).order('name'),
  ])
  if (!order) notFound()

  const action = updateOrder.bind(null, params.id)

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/pedidos/${params.id}`} className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Editar Pedido #{order.order_number}</h1>
      </div>
      <OrderForm action={action} customers={customers ?? []} defaultValues={order} />
    </div>
  )
}

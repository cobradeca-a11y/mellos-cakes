import { createClient } from '@/lib/supabase/server'
import { createOrder } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { OrderForm } from '../OrderForm'

export const metadata = { title: 'Novo Pedido' }

export default async function NovoPedidoPage({
  searchParams,
}: {
  searchParams: { cliente?: string }
}) {
  const supabase = createClient()
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name')
    .eq('active', true)
    .order('name')

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/pedidos" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Novo Pedido</h1>
      </div>
      <OrderForm
        action={createOrder}
        customers={customers ?? []}
        defaultCustomerId={searchParams.cliente}
      />
    </div>
  )
}

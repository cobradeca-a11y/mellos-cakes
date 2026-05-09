import { createClient } from '@/lib/supabase/server'
<<<<<<< HEAD
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
=======
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NovoPedidoClient } from './NovoPedidoClient'

export const metadata = { title: 'Novo Pedido' }

export default async function NovoPedidoPage({ searchParams }: { searchParams: { cliente?: string } }) {
  const supabase = createClient()

  const [
    { data: customers },
    { data: sizes },
    { data: flavors },
    { data: fillings },
    { data: toppings },
  ] = await Promise.all([
    supabase.from('customers').select('id, name').eq('active', true).order('name'),
    supabase.from('cake_sizes').select('*').eq('active', true).order('sort_order'),
    supabase.from('cake_flavors').select('*').eq('active', true).order('sort_order'),
    supabase.from('cake_fillings').select('*').eq('active', true).order('sort_order'),
    supabase.from('cake_toppings').select('*').eq('active', true).order('sort_order'),
  ])

  return (
    <div className="max-w-3xl space-y-5">
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
      <div className="flex items-center gap-3">
        <Link href="/pedidos" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Novo Pedido</h1>
      </div>
<<<<<<< HEAD
      <OrderForm
        action={createOrder}
        customers={customers ?? []}
=======
      <NovoPedidoClient
        customers={customers ?? []}
        sizes={sizes ?? []}
        flavors={flavors ?? []}
        fillings={fillings ?? []}
        toppings={toppings ?? []}
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
        defaultCustomerId={searchParams.cliente}
      />
    </div>
  )
}

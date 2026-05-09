import { createClient } from '@/lib/supabase/server'
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
      <div className="flex items-center gap-3">
        <Link href="/pedidos" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Novo Pedido</h1>
      </div>
      <NovoPedidoClient
        customers={customers ?? []}
        sizes={sizes ?? []}
        flavors={flavors ?? []}
        fillings={fillings ?? []}
        toppings={toppings ?? []}
        defaultCustomerId={searchParams.cliente}
      />
    </div>
  )
}

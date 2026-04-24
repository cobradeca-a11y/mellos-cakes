import { createClient } from '@/lib/supabase/server'
import { createOrder } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { OrderForm } from '../OrderForm'
import { CakeSelector } from '../CakeSelector'

export const metadata = { title: 'Novo Pedido' }

export default async function NovoPedidoPage({ searchParams }: { searchParams: { cliente?: string } }) {
  const supabase = createClient()

  const [
    { data: customers },
    { data: sizes },
    { data: flavors },
    { data: surcharges },
  ] = await Promise.all([
    supabase.from('customers').select('id, name').eq('active', true).order('name'),
    supabase.from('cake_sizes').select('*').eq('active', true).order('sort_order'),
    supabase.from('cake_flavors').select('*').eq('active', true).order('sort_order'),
    supabase.from('cake_surcharges').select('*'),
  ])

  const massas    = (flavors ?? []).filter(f => f.type === 'massa')
  const recheios  = (flavors ?? []).filter(f => f.type === 'recheio')
  const coberturas = (flavors ?? []).filter(f => f.type === 'cobertura')

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/pedidos" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Novo Pedido</h1>
      </div>

      <CakeSelector
        sizes={sizes ?? []}
        massas={massas}
        recheios={recheios}
        coberturas={coberturas}
        surcharges={surcharges ?? []}
      />

      <OrderForm
        action={createOrder}
        customers={customers ?? []}
        defaultCustomerId={searchParams.cliente}
      />
    </div>
  )
}

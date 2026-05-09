import { createClient } from '@/lib/supabase/server'
import { createPurchaseOrder } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PurchaseOrderForm } from '../PurchaseOrderForm'

export const metadata = { title: 'Nova Compra' }

export default async function NovaCompraPage() {
  const supabase = createClient()
  const [{ data: suppliers }, { data: ingredients }] = await Promise.all([
    supabase.from('suppliers').select('id,name').eq('active', true).order('name'),
    supabase.from('ingredients').select('id,name,unit,cost_per_unit').eq('active', true).order('name'),
  ])

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/compras" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Nova Compra</h1>
      </div>
      <PurchaseOrderForm action={createPurchaseOrder} suppliers={suppliers ?? []} ingredients={ingredients ?? []} />
    </div>
  )
}

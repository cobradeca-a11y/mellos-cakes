'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

export async function createPurchaseOrder(formData: FormData) {
  const supabase = createClient()
  const itemsJson = formData.get('items') as string
  const items = itemsJson ? JSON.parse(itemsJson) : []
  const totalAmount = items.reduce((s: number, i: any) => s + i.total_price, 0)

  const { data: order, error } = await supabase.from('purchase_orders').insert({
    business_id: BUSINESS_ID,
    supplier_id: formData.get('supplier_id') as string || null,
    status: 'pendente',
    total_amount: totalAmount,
    expected_delivery: formData.get('expected_delivery') as string || null,
    notes: formData.get('notes') as string || null,
  }).select().single()

  if (error) throw new Error(error.message)

  if (items.length > 0) {
    await supabase.from('purchase_order_items').insert(
      items.map((item: any) => ({ ...item, purchase_order_id: order.id }))
    )
  }

  revalidatePath('/compras')
  redirect(`/compras/${order.id}`)
}

export async function updatePurchaseOrderStatus(id: string, status: string) {
  const supabase = createClient()

  await supabase.from('purchase_orders').update({ status }).eq('id', id)

  // On receive: update stock for each item
  if (status === 'recebido') {
    const { data: items } = await supabase
      .from('purchase_order_items')
      .select('*, ingredients(stock_quantity)')
      .eq('purchase_order_id', id)

    for (const item of items ?? []) {
      const received = item.received_quantity ?? item.quantity
      const currentStock = (item.ingredients as any)?.stock_quantity ?? 0
      await supabase.from('ingredients').update({
        stock_quantity: currentStock + received,
        cost_per_unit: item.unit_price,
      }).eq('id', item.ingredient_id)

      await supabase.from('ingredient_movements').insert({
        ingredient_id: item.ingredient_id,
        type: 'entrada',
        quantity: received,
        unit_cost: item.unit_price,
        reason: `Pedido de compra #${id.slice(0,8)}`,
        purchase_order_id: id,
      })
    }
  }

  revalidatePath('/compras')
  revalidatePath(`/compras/${id}`)
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateOrderNumber } from '@/lib/utils'

export async function createOrder(formData: FormData) {
  const supabase = createClient()

  const totalAmount = Number(formData.get('total_amount') ?? 0)
  const depositPaid = Number(formData.get('deposit_paid') ?? 0)

  const data = {
    customer_id: formData.get('customer_id') as string || null,
    order_number: generateOrderNumber(),
    status: 'confirmado',
    total_amount: totalAmount,
    estimated_cost: Number(formData.get('estimated_cost') ?? 0),
    deposit_paid: depositPaid,
    balance_due: totalAmount - depositPaid,
    payment_method: formData.get('payment_method') as string || null,
    delivery_date: formData.get('delivery_date') as string,
    notes: formData.get('notes') as string || null,
  }

  const { data: order, error } = await supabase.from('orders').insert(data).select().single()
  if (error) throw new Error(error.message)

  revalidatePath('/pedidos')
  redirect(`/pedidos/${order.id}`)
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = createClient()
  await supabase.from('orders').update({ status }).eq('id', id)
  revalidatePath('/pedidos')
  revalidatePath(`/pedidos/${id}`)
}

export async function updateOrder(id: string, formData: FormData) {
  const supabase = createClient()

  const totalAmount = Number(formData.get('total_amount') ?? 0)
  const depositPaid = Number(formData.get('deposit_paid') ?? 0)

  const data = {
    customer_id: formData.get('customer_id') as string || null,
    status: formData.get('status') as string,
    total_amount: totalAmount,
    estimated_cost: Number(formData.get('estimated_cost') ?? 0),
    deposit_paid: depositPaid,
    balance_due: totalAmount - depositPaid,
    payment_method: formData.get('payment_method') as string || null,
    delivery_date: formData.get('delivery_date') as string,
    notes: formData.get('notes') as string || null,
  }

  const { error } = await supabase.from('orders').update(data).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/pedidos')
  redirect(`/pedidos/${id}`)
}

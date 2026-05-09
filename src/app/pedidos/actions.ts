'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
<<<<<<< HEAD
=======

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
import { generateOrderNumber } from '@/lib/utils'

export async function createOrder(formData: FormData) {
  const supabase = createClient()

  const totalAmount = Number(formData.get('total_amount') ?? 0)
  const depositPaid = Number(formData.get('deposit_paid') ?? 0)

  const data = {
    customer_id: formData.get('customer_id') as string || null,
    order_number: generateOrderNumber(),
<<<<<<< HEAD
=======
    business_id: BUSINESS_ID,
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
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

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

export async function createGasto(formData: FormData) {
  const supabase = createClient()
  const data = {
    business_id: BUSINESS_ID,
    type: 'despesa',
    category: formData.get('category') as string,
    description: formData.get('description') as string,
    amount: Number(formData.get('amount')),
    date: formData.get('date') as string,
    payment_method: formData.get('payment_method') as string || null,
    paid: formData.get('paid') === 'true',
    notes: formData.get('notes') as string || null,
  }
  const { error } = await supabase.from('cashflow_entries').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/gastos')
  revalidatePath('/financeiro')
  redirect('/gastos')
}

export async function deleteGasto(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('cashflow_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/gastos')
  revalidatePath('/financeiro')
  redirect('/gastos')
}

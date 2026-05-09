'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'
const EXPENSES_PATH = '/despesas-operacionais'

function getPayload(formData: FormData) {
  return {
    business_id: BUSINESS_ID,
    type: 'despesa',
    category: formData.get('category') as string,
    description: (formData.get('description') as string)?.trim(),
    amount: Number(formData.get('amount') ?? 0),
    date: formData.get('date') as string,
    payment_method: (formData.get('payment_method') as string) || null,
    paid: formData.get('paid') === 'true',
    notes: ((formData.get('notes') as string) || '').trim() || null,
  }
}

export async function createOperationalExpense(formData: FormData) {
  const supabase = createClient()
  const { error } = await supabase.from('cashflow_entries').insert(getPayload(formData))
  if (error) throw new Error(error.message)

  revalidatePath(EXPENSES_PATH)
  revalidatePath('/financeiro')
  redirect(EXPENSES_PATH)
}

export async function updateOperationalExpense(id: string, formData: FormData) {
  const supabase = createClient()
  const { error } = await supabase
    .from('cashflow_entries')
    .update(getPayload(formData))
    .eq('id', id)
    .eq('type', 'despesa')

  if (error) throw new Error(error.message)

  revalidatePath(EXPENSES_PATH)
  revalidatePath('/financeiro')
  redirect(EXPENSES_PATH)
}

export async function deleteOperationalExpense(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('cashflow_entries')
    .delete()
    .eq('id', id)
    .eq('type', 'despesa')

  if (error) throw new Error(error.message)

  revalidatePath(EXPENSES_PATH)
  revalidatePath('/financeiro')
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

function generateQuoteNumber() {
  const d = new Date()
  return `ORC${d.getFullYear().toString().slice(-2)}${String(d.getMonth()+1).padStart(2,'0')}${Math.floor(Math.random()*9000+1000)}`
}

export async function createQuote(formData: FormData) {
  const supabase = createClient()
  const { data: quote, error } = await supabase.from('quotes').insert({
    business_id: BUSINESS_ID,
    customer_id: formData.get('customer_id') as string || null,
    quote_number: generateQuoteNumber(),
    status: 'rascunho',
    total_amount: Number(formData.get('total_amount') ?? 0),
    valid_until: formData.get('valid_until') as string || null,
    deposit_required: Number(formData.get('deposit_required') ?? 0),
    notes: formData.get('notes') as string || null,
  }).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/orcamentos')
  redirect(`/orcamentos/${quote.id}`)
}

export async function updateQuoteStatus(id: string, status: string) {
  const supabase = createClient()
  await supabase.from('quotes').update({ status }).eq('id', id)
  revalidatePath('/orcamentos')
  revalidatePath(`/orcamentos/${id}`)
}

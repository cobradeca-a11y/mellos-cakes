'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

export async function createCustomer(formData: FormData) {
  const supabase = createClient()

  const data = {
    business_id: BUSINESS_ID,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    birthdate: formData.get('birthdate') as string || null,
    preferences: formData.get('preferences') as string || null,
    restrictions: formData.get('restrictions') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { error } = await supabase.from('customers').insert(data)
  if (error) throw new Error(error.message)

  revalidatePath('/clientes')
  redirect('/clientes')
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = createClient()

  const data = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    birthdate: formData.get('birthdate') as string || null,
    preferences: formData.get('preferences') as string || null,
    restrictions: formData.get('restrictions') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { error } = await supabase.from('customers').update(data).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/clientes')
  redirect(`/clientes/${id}`)
}

export async function deleteCustomer(id: string) {
  const supabase = createClient()
  await supabase.from('customers').update({ active: false }).eq('id', id)
  revalidatePath('/clientes')
  redirect('/clientes')
}

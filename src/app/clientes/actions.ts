'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

export async function createCustomer(formData: FormData) {
  const supabase = createClient()

  const name = formData.get('name') as string
  if (!name?.trim()) throw new Error('Nome é obrigatório')

  const { error } = await supabase.from('customers').insert({
    business_id: BUSINESS_ID,
    name: name.trim(),
    phone: (formData.get('phone') as string)?.trim() || null,
    email: (formData.get('email') as string)?.trim() || null,
    birthdate: (formData.get('birthdate') as string) || null,
    preferences: (formData.get('preferences') as string)?.trim() || null,
    restrictions: (formData.get('restrictions') as string)?.trim() || null,
    notes: (formData.get('notes') as string)?.trim() || null,
  })

  if (error) {
    console.error('createCustomer error:', JSON.stringify(error))
    throw new Error(error.message)
  }

  revalidatePath('/clientes')
  redirect('/clientes')
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = createClient()

  const { error } = await supabase.from('customers').update({
    name: (formData.get('name') as string).trim(),
    phone: (formData.get('phone') as string)?.trim() || null,
    email: (formData.get('email') as string)?.trim() || null,
    birthdate: (formData.get('birthdate') as string) || null,
    preferences: (formData.get('preferences') as string)?.trim() || null,
    restrictions: (formData.get('restrictions') as string)?.trim() || null,
    notes: (formData.get('notes') as string)?.trim() || null,
  }).eq('id', id)

  if (error) {
    console.error('updateCustomer error:', JSON.stringify(error))
    throw new Error(error.message)
  }

  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
  redirect(`/clientes/${id}`)
}

export async function deleteCustomer(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) {
    console.error('deleteCustomer error:', JSON.stringify(error))
    throw new Error(error.message)
  }
  revalidatePath('/clientes')
  redirect('/clientes')
}

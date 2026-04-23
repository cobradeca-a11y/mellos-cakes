'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createSupplier(formData: FormData) {
  const supabase = createClient()
  const data = {
    name: formData.get('name') as string,
    contact_name: formData.get('contact_name') as string || null,
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    notes: formData.get('notes') as string || null,
  }
  const { error } = await supabase.from('suppliers').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/fornecedores')
  redirect('/fornecedores')
}

export async function updateSupplier(id: string, formData: FormData) {
  const supabase = createClient()
  const data = {
    name: formData.get('name') as string,
    contact_name: formData.get('contact_name') as string || null,
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    notes: formData.get('notes') as string || null,
  }
  const { error } = await supabase.from('suppliers').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/fornecedores')
  redirect('/fornecedores')
}

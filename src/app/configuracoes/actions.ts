'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSettings(formData: FormData) {
  const supabase = createClient()
  const data = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    currency: formData.get('currency') as string,
    default_markup: Number(formData.get('default_markup') ?? 2.5),
  }
  const { data: existing } = await supabase.from('business_settings').select('id').limit(1).single()
  if (existing) {
    await supabase.from('business_settings').update(data).eq('id', existing.id)
  } else {
    await supabase.from('business_settings').insert(data)
  }
  revalidatePath('/configuracoes')
}

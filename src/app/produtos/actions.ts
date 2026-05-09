'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

export async function createProduct(formData: FormData) {
  const supabase = createClient()
  const data = {
    business_id: BUSINESS_ID,
    name: formData.get('name') as string,
    category_id: formData.get('category_id') as string || null,
    description: formData.get('description') as string || null,
    base_price: Number(formData.get('base_price') ?? 0),
    min_production_days: Number(formData.get('min_production_days') ?? 3),
    available: formData.get('available') === 'true',
    featured: formData.get('featured') === 'true',
  }
  const { data: product, error } = await supabase.from('products').insert(data).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/produtos')
  redirect(`/produtos/${product.id}`)
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createClient()
  const data = {
    name: formData.get('name') as string,
    category_id: formData.get('category_id') as string || null,
    description: formData.get('description') as string || null,
    base_price: Number(formData.get('base_price') ?? 0),
    min_production_days: Number(formData.get('min_production_days') ?? 3),
    available: formData.get('available') === 'true',
    featured: formData.get('featured') === 'true',
  }
  const { error } = await supabase.from('products').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/produtos')
  redirect(`/produtos/${id}`)
}

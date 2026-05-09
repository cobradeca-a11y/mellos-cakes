'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

export async function createIngredient(formData: FormData) {
  const supabase = createClient()
  const data = {
    business_id: BUSINESS_ID,
    name: formData.get('name') as string,
    category: formData.get('category') as string || null,
    supplier_id: formData.get('supplier_id') as string || null,
    unit: formData.get('unit') as string,
    cost_per_unit: Number(formData.get('cost_per_unit') ?? 0),
    stock_quantity: Number(formData.get('stock_quantity') ?? 0),
    min_stock: Number(formData.get('min_stock') ?? 0),
    expiry_date: formData.get('expiry_date') as string || null,
    lot: formData.get('lot') as string || null,
    notes: formData.get('notes') as string || null,
  }
  const { error } = await supabase.from('ingredients').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/ingredientes')
  redirect('/ingredientes')
}

export async function updateIngredient(id: string, formData: FormData) {
  const supabase = createClient()
  const data = {
    name: formData.get('name') as string,
    category: formData.get('category') as string || null,
    supplier_id: formData.get('supplier_id') as string || null,
    unit: formData.get('unit') as string,
    cost_per_unit: Number(formData.get('cost_per_unit') ?? 0),
    stock_quantity: Number(formData.get('stock_quantity') ?? 0),
    min_stock: Number(formData.get('min_stock') ?? 0),
    expiry_date: formData.get('expiry_date') as string || null,
    lot: formData.get('lot') as string || null,
    notes: formData.get('notes') as string || null,
  }
  const { error } = await supabase.from('ingredients').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/ingredientes')
  redirect(`/ingredientes/${id}`)
}

export async function addStockMovement(formData: FormData) {
  const supabase = createClient()
  const ingredientId = formData.get('ingredient_id') as string
  const qty = Number(formData.get('quantity'))
  const type = formData.get('type') as string

  await supabase.from('ingredient_movements').insert({
    ingredient_id: ingredientId,
    type,
    quantity: qty,
    reason: formData.get('reason') as string || null,
  })

  // Update stock
  const { data: ing } = await supabase.from('ingredients').select('stock_quantity').eq('id', ingredientId).single()
  if (ing) {
    const newQty = type === 'entrada' ? ing.stock_quantity + qty : ing.stock_quantity - qty
    await supabase.from('ingredients').update({ stock_quantity: Math.max(0, newQty) }).eq('id', ingredientId)
  }

  revalidatePath(`/ingredientes/${ingredientId}`)
  revalidatePath('/ingredientes')
}

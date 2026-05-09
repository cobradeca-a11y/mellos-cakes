'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

export async function createRecipe(formData: FormData) {
  const supabase = createClient()

  const data = {
    business_id: BUSINESS_ID,
    name: formData.get('name') as string,
    category: formData.get('category') as string || null,
    yield_quantity: Number(formData.get('yield_quantity') ?? 1),
    yield_unit: formData.get('yield_unit') as string || 'unidade',
    prep_time_minutes: Number(formData.get('prep_time_minutes')) || null,
    instructions: formData.get('instructions') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { data: recipe, error } = await supabase.from('recipes').insert(data).select().single()
  if (error) throw new Error(error.message)

  // Parse recipe items JSON
  const itemsJson = formData.get('items') as string
  if (itemsJson) {
    const items = JSON.parse(itemsJson)
    if (items.length > 0) {
      await supabase.from('recipe_items').insert(
        items.map((item: any) => ({ ...item, recipe_id: recipe.id }))
      )
    }
  }

  revalidatePath('/receitas')
  redirect(`/receitas/${recipe.id}`)
}

export async function updateRecipe(id: string, formData: FormData) {
  const supabase = createClient()

  const data = {
    name: formData.get('name') as string,
    category: formData.get('category') as string || null,
    yield_quantity: Number(formData.get('yield_quantity') ?? 1),
    yield_unit: formData.get('yield_unit') as string || 'unidade',
    prep_time_minutes: Number(formData.get('prep_time_minutes')) || null,
    instructions: formData.get('instructions') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { error } = await supabase.from('recipes').update(data).eq('id', id)
  if (error) throw new Error(error.message)

  // Replace recipe items
  await supabase.from('recipe_items').delete().eq('recipe_id', id)
  const itemsJson = formData.get('items') as string
  if (itemsJson) {
    const items = JSON.parse(itemsJson)
    if (items.length > 0) {
      await supabase.from('recipe_items').insert(
        items.map((item: any) => ({ ...item, recipe_id: id }))
      )
    }
  }

  revalidatePath('/receitas')
  redirect(`/receitas/${id}`)
}

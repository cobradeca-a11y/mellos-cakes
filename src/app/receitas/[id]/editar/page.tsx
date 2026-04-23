import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateRecipe } from '../../actions'
import { RecipeForm } from '../../RecipeForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditarReceitaPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [{ data: recipe }, { data: ingredients }] = await Promise.all([
    supabase.from('recipes').select('*, recipe_items(*)').eq('id', params.id).single(),
    supabase.from('ingredients').select('id, name, unit, cost_per_unit').eq('active', true).order('name'),
  ])
  if (!recipe) notFound()

  const action = updateRecipe.bind(null, params.id)

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/receitas/${params.id}`} className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Editar Receita</h1>
      </div>
      <RecipeForm
        action={action}
        ingredients={ingredients ?? []}
        defaultValues={recipe}
        defaultItems={(recipe.recipe_items ?? []).map((i: any) => ({
          ingredient_id: i.ingredient_id,
          quantity: i.quantity,
          unit: i.unit,
        }))}
      />
    </div>
  )
}

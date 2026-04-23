import { createClient } from '@/lib/supabase/server'
import { createRecipe } from '../actions'
import { RecipeForm } from '../RecipeForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Nova Receita' }

export default async function NovaReceitaPage() {
  const supabase = createClient()
  const { data: ingredients } = await supabase
    .from('ingredients')
    .select('id, name, unit, cost_per_unit')
    .eq('active', true)
    .order('name')

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/receitas" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Nova Receita</h1>
      </div>
      <RecipeForm action={createRecipe} ingredients={ingredients ?? []} />
    </div>
  )
}

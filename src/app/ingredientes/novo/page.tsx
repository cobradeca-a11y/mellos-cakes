import { createClient } from '@/lib/supabase/server'
import { createIngredient } from '../actions'
import { IngredientForm } from '../IngredientForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Novo Ingrediente' }

export default async function NovoIngredientePage() {
  const supabase = createClient()
  const { data: suppliers } = await supabase.from('suppliers').select('id,name').eq('active', true).order('name')

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/ingredientes" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Novo Ingrediente</h1>
      </div>
      <IngredientForm action={createIngredient} suppliers={suppliers ?? []} />
    </div>
  )
}

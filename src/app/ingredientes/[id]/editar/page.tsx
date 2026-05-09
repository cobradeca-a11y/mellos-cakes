import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateIngredient } from '../../actions'
import { IngredientForm } from '../../IngredientForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditarIngredientePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [{ data: ing }, { data: suppliers }] = await Promise.all([
    supabase.from('ingredients').select('*').eq('id', params.id).single(),
    supabase.from('suppliers').select('id,name').eq('active', true).order('name'),
  ])
  if (!ing) notFound()

  const action = updateIngredient.bind(null, params.id)

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/ingredientes/${params.id}`} className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Editar Ingrediente</h1>
      </div>
      <IngredientForm action={action} suppliers={suppliers ?? []} defaultValues={ing} />
    </div>
  )
}

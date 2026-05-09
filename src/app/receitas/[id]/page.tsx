import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Clock, BookOpen } from 'lucide-react'

export default async function ReceitaDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*, recipe_items(*, ingredients(name, unit, cost_per_unit))')
    .eq('id', params.id)
    .single()

  if (!recipe) notFound()

  const totalCost = (recipe.recipe_items ?? []).reduce((sum: number, item: any) => {
    return sum + (item.ingredients?.cost_per_unit ?? 0) * item.quantity
  }, 0)
  const costPerUnit = recipe.yield_quantity > 0 ? totalCost / recipe.yield_quantity : 0
  const suggestedPrice = costPerUnit * 2.5

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/receitas" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="page-title">{recipe.name}</h1>
        </div>
        <Link href={`/receitas/${params.id}/editar`} className="btn-secondary">
          <Edit2 className="w-4 h-4" /> Editar
        </Link>
      </div>

      {/* Header info */}
      <div className="card p-5 flex flex-wrap gap-6">
        <div>
          <p className="text-xs text-neutral-500">Rendimento</p>
          <p className="font-semibold text-neutral-900">{recipe.yield_quantity} {recipe.yield_unit}</p>
        </div>
        {recipe.category && (
          <div><p className="text-xs text-neutral-500">Categoria</p><span className="badge-gray">{recipe.category}</span></div>
        )}
        {recipe.prep_time_minutes && (
          <div>
            <p className="text-xs text-neutral-500">Tempo de Preparo</p>
            <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" /> {recipe.prep_time_minutes} min
            </p>
          </div>
        )}
      </div>

      {/* Cost summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-xl font-display font-bold text-neutral-900">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-neutral-500 mt-1">Custo Total</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-display font-bold text-neutral-900">{formatCurrency(costPerUnit)}</p>
          <p className="text-xs text-neutral-500 mt-1">Por {recipe.yield_unit}</p>
        </div>
        <div className="card p-4 text-center bg-brand-50 border-brand-200">
          <p className="text-xl font-display font-bold text-brand-600">{formatCurrency(suggestedPrice)}</p>
          <p className="text-xs text-brand-500 mt-1">Preço Sugerido (2.5x)</p>
        </div>
      </div>

      {/* Ingredients */}
      <div className="table-container">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-800">Ingredientes</h3>
        </div>
        <table className="table">
          <thead>
            <tr><th>Ingrediente</th><th>Qtd.</th><th>Custo/Un.</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {(recipe.recipe_items ?? []).map((item: any) => {
              const subtotal = (item.ingredients?.cost_per_unit ?? 0) * item.quantity
              return (
                <tr key={item.id}>
                  <td className="font-medium text-neutral-900">{item.ingredients?.name ?? '—'}</td>
                  <td className="font-mono text-sm">{item.quantity} {item.unit}</td>
                  <td>{formatCurrency(item.ingredients?.cost_per_unit ?? 0)}</td>
                  <td className="font-semibold">{formatCurrency(subtotal)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-50">
              <td colSpan={3} className="px-4 py-3 font-semibold text-neutral-700">Total</td>
              <td className="px-4 py-3 font-bold text-neutral-900">{formatCurrency(totalCost)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {recipe.instructions && (
        <div className="card p-5">
          <h3 className="font-semibold text-neutral-800 mb-3">Modo de Preparo</h3>
          <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{recipe.instructions}</p>
        </div>
      )}
    </div>
  )
}

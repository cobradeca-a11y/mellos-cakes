import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, ShoppingBag, Star, Clock } from 'lucide-react'

export default async function ProdutoDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*, product_categories(name), recipe_compositions(*, recipes(name, yield_quantity, yield_unit, recipe_items(quantity, ingredients(cost_per_unit))))')
    .eq('id', params.id)
    .single()

  if (!product) notFound()

  // Calculate total cost from all recipe compositions
  const totalCost = (product.recipe_compositions ?? []).reduce((sum: number, comp: any) => {
    const recipeCost = (comp.recipes?.recipe_items ?? []).reduce((rs: number, ri: any) => {
      return rs + (ri.ingredients?.cost_per_unit ?? 0) * ri.quantity
    }, 0)
    return sum + recipeCost * comp.quantity
  }, 0)
  const margin = totalCost > 0 ? ((product.base_price - totalCost) / product.base_price * 100).toFixed(1) : null

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/produtos" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="page-title">{product.name}</h1>
        </div>
        <Link href={`/produtos/${params.id}/editar`} className="btn-secondary">
          <Edit2 className="w-4 h-4" /> Editar
        </Link>
      </div>

      {/* Header */}
      <div className="card p-5 flex gap-5">
        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-brand-50 to-rose-50 flex items-center justify-center shrink-0">
          {product.images?.[0]
            ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-xl" />
            : <ShoppingBag className="w-10 h-10 text-brand-300" />
          }
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            {product.product_categories && <span className="badge-gray">{(product.product_categories as any).name}</span>}
            {product.featured && <span className="badge bg-yellow-100 text-yellow-700"><Star className="w-3 h-3 fill-current" /> Destaque</span>}
            <span className={product.available ? 'badge-green' : 'badge-red'}>
              {product.available ? 'Disponível' : 'Indisponível'}
            </span>
          </div>
          <p className="text-2xl font-display font-bold text-brand-500">{formatCurrency(product.base_price)}</p>
          <p className="text-sm text-neutral-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {product.min_production_days} dias de preparo
          </p>
        </div>
      </div>

      {product.description && (
        <div className="card p-5">
          <h3 className="font-semibold text-neutral-800 mb-2">Descrição</h3>
          <p className="text-sm text-neutral-700">{product.description}</p>
        </div>
      )}

      {/* Cost analysis */}
      {totalCost > 0 && (
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-neutral-800">Análise de Custo</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-neutral-50 rounded-xl p-3">
              <p className="text-lg font-bold text-neutral-900">{formatCurrency(totalCost)}</p>
              <p className="text-xs text-neutral-500">Custo Total</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-3">
              <p className="text-lg font-bold text-neutral-900">{formatCurrency(product.base_price - totalCost)}</p>
              <p className="text-xs text-neutral-500">Lucro Bruto</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-3">
              <p className="text-lg font-bold text-brand-600">{margin}%</p>
              <p className="text-xs text-brand-500">Margem</p>
            </div>
          </div>
        </div>
      )}

      {/* Compositions */}
      {(product.recipe_compositions ?? []).length > 0 && (
        <div className="table-container">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-800">Ficha Técnica</h3>
          </div>
          <table className="table">
            <thead>
              <tr><th>Receita</th><th>Papel</th><th>Quantidade</th></tr>
            </thead>
            <tbody>
              {(product.recipe_compositions ?? []).map((comp: any) => (
                <tr key={comp.id}>
                  <td className="font-medium text-neutral-900">
                    <Link href={`/receitas/${comp.recipe_id}`} className="hover:text-brand-500">
                      {comp.recipes?.name ?? '—'}
                    </Link>
                  </td>
                  <td><span className="badge-gray capitalize">{comp.role}</span></td>
                  <td className="font-mono text-sm">{comp.quantity}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

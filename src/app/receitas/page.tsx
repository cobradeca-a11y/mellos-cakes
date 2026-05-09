import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Plus, BookOpen } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Receitas' }

export default async function ReceitasPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createClient()
  const q = searchParams.q ?? ''

  let query = supabase
    .from('recipes')
    .select('*, recipe_items(ingredient_id, quantity, unit, ingredients(cost_per_unit))', { count: 'exact' })
    .eq('active', true)
    .order('name')

  if (q) query = query.ilike('name', `%${q}%`)

  const { data: recipes, count } = await query

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Receitas</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">{count ?? 0} receitas</p>
        </div>
        <Link href="/receitas/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Nova Receita
        </Link>
      </div>

      <div className="card p-4">
        <form className="flex gap-3">
          <input name="q" defaultValue={q} placeholder="Buscar receita..." className="input flex-1" />
          <button type="submit" className="btn-primary">Buscar</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(recipes ?? []).length === 0 ? (
          <div className="col-span-3 card p-12 text-center text-[var(--muted)]">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhuma receita cadastrada</p>
          </div>
        ) : (
          (recipes ?? []).map((r: any) => {
            const totalCost = (r.recipe_items ?? []).reduce((sum: number, item: any) => {
              const unitCost = item.ingredients?.cost_per_unit ?? 0
              return sum + (unitCost * item.quantity)
            }, 0)
            const costPerUnit = r.yield_quantity > 0 ? totalCost / r.yield_quantity : 0

            return (
              <Link key={r.id} href={`/receitas/${r.id}`}
                className="card-hover p-5 block hover:border-brand-200 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-brand-500" />
                  </div>
                  {r.category && <span className="badge-gray">{r.category}</span>}
                </div>
                <h3 className="font-semibold text-[var(--text-1)]">{r.name}</h3>
                <p className="text-sm text-[var(--text-3)] mt-1">
                  Rendimento: {r.yield_quantity} {r.yield_unit}
                </p>
                <div className="flex gap-4 mt-3 pt-3 border-t border-[var(--border-light)] text-sm">
                  <div>
                    <p className="text-xs text-[var(--muted)]">Custo total</p>
                    <p className="font-semibold text-[var(--text-1)]">{formatCurrency(totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">Por {r.yield_unit}</p>
                    <p className="font-semibold text-[var(--text-1)]">{formatCurrency(costPerUnit)}</p>
                  </div>
                  {r.prep_time_minutes && (
                    <div>
                      <p className="text-xs text-[var(--muted)]">Preparo</p>
                      <p className="font-semibold text-[var(--text-1)]">{r.prep_time_minutes}min</p>
                    </div>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

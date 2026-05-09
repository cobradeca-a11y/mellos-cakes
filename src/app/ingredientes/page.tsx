import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Plus, Cookie, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Ingredientes' }

export default async function IngredientesPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createClient()
  const q = searchParams.q ?? ''

  let query = supabase
    .from('ingredients')
    .select('*, suppliers(name)', { count: 'exact' })
    .eq('active', true)
    .order('name')

  if (q) query = query.ilike('name', `%${q}%`)

  const { data: ingredients, count } = await query

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ingredientes</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{count ?? 0} cadastrados</p>
        </div>
        <Link href="/ingredientes/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Ingrediente
        </Link>
      </div>

      <div className="card p-4">
        <form className="flex gap-3">
          <input name="q" defaultValue={q} placeholder="Buscar ingrediente..." className="input flex-1" />
          <button type="submit" className="btn-primary">Buscar</button>
        </form>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Fornecedor</th>
              <th>Unidade</th>
              <th>Custo/Un.</th>
              <th>Estoque</th>
              <th>Mínimo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(ingredients ?? []).length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-neutral-400">
                  <Cookie className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum ingrediente encontrado</p>
                </td>
              </tr>
            ) : (
              (ingredients ?? []).map((ing: any) => {
                const lowStock = ing.stock_quantity <= ing.min_stock
                return (
                  <tr key={ing.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        {lowStock && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                        <span className="font-medium text-neutral-900">{ing.name}</span>
                      </div>
                    </td>
                    <td>{ing.category ?? '—'}</td>
                    <td>{ing.suppliers?.name ?? '—'}</td>
                    <td className="font-mono text-sm">{ing.unit}</td>
                    <td>{formatCurrency(ing.cost_per_unit)}</td>
                    <td>
                      <span className={lowStock ? 'text-red-600 font-semibold' : 'text-neutral-700'}>
                        {ing.stock_quantity} {ing.unit}
                      </span>
                    </td>
                    <td className="text-neutral-500">{ing.min_stock} {ing.unit}</td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <Link href={`/ingredientes/${ing.id}`} className="btn-ghost text-xs py-1 px-2">Ver</Link>
                        <Link href={`/ingredientes/${ing.id}/editar`} className="btn-ghost text-xs py-1 px-2">Editar</Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

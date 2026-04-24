import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, TrendingUp, TrendingDown } from 'lucide-react'
import { addStockMovement } from '../actions'

export default async function IngredienteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [{ data: ing }, { data: movements }] = await Promise.all([
    supabase.from('ingredients').select('*, suppliers(name)').eq('id', params.id).single(),
    supabase.from('ingredient_movements').select('*').eq('ingredient_id', params.id)
      .order('created_at', { ascending: false }).limit(20),
  ])
  if (!ing) notFound()

  const lowStock = ing.stock_quantity <= ing.min_stock
  const stockValue = ing.stock_quantity * ing.cost_per_unit

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ingredientes" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="page-title">{ing.name}</h1>
        </div>
        <Link href={`/ingredientes/${params.id}/editar`} className="btn-secondary">
          <Edit2 className="w-4 h-4" /> Editar
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className={`text-2xl font-display font-bold ${lowStock ? 'text-red-500' : 'text-[var(--text-1)]'}`}>
            {ing.stock_quantity} {ing.unit}
          </p>
          <p className="text-xs text-[var(--text-3)] mt-1">Estoque Atual</p>
          {lowStock && <span className="badge-red mt-1">Crítico</span>}
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-[var(--text-1)]">{formatCurrency(ing.cost_per_unit)}</p>
          <p className="text-xs text-[var(--text-3)] mt-1">Custo / {ing.unit}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-[var(--text-1)]">{formatCurrency(stockValue)}</p>
          <p className="text-xs text-[var(--text-3)] mt-1">Valor em Estoque</p>
        </div>
      </div>

      {/* Info */}
      <div className="card p-5 grid grid-cols-2 gap-3 text-sm">
        {[
          ['Categoria', ing.category ?? '—'],
          ['Fornecedor', (ing.suppliers as any)?.name ?? '—'],
          ['Estoque Mínimo', `${ing.min_stock} ${ing.unit}`],
          ['Validade', ing.expiry_date ? formatDate(ing.expiry_date) : '—'],
          ['Lote', ing.lot ?? '—'],
        ].map(([k,v]) => (
          <div key={k}>
            <p className="text-xs text-[var(--text-3)] mb-0.5">{k}</p>
            <p className="font-medium text-[var(--text-1)]">{v}</p>
          </div>
        ))}
      </div>

      {/* Add movement */}
      <div className="card p-5">
        <h3 className="font-semibold text-[var(--text-1)] mb-4">Movimentar Estoque</h3>
        <form action={addStockMovement} className="flex flex-wrap gap-3 items-end">
          <input type="hidden" name="ingredient_id" value={params.id} />
          <div>
            <label className="label">Tipo</label>
            <select name="type" className="input">
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>
          <div>
            <label className="label">Quantidade ({ing.unit})</label>
            <input type="number" step="0.001" min="0" name="quantity" required className="input w-32" />
          </div>
          <div className="flex-1 min-w-40">
            <label className="label">Motivo</label>
            <input name="reason" placeholder="Ex: Compra, Uso em receita..." className="input" />
          </div>
          <button type="submit" className="btn-primary">Registrar</button>
        </form>
      </div>

      {/* Movement history */}
      <div className="table-container">
        <div className="px-5 py-4 border-b border-[var(--border-light)]">
          <h3 className="font-semibold text-[var(--text-1)]">Histórico de Movimentações</h3>
        </div>
        <table className="table">
          <thead>
            <tr><th>Data</th><th>Tipo</th><th>Qtd.</th><th>Motivo</th></tr>
          </thead>
          <tbody>
            {(movements ?? []).length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-[var(--muted)]">Sem movimentações</td></tr>
            ) : (
              (movements ?? []).map((m: any) => (
                <tr key={m.id}>
                  <td>{formatDate(m.created_at)}</td>
                  <td>
                    <span className={m.type === 'entrada' ? 'badge-green' : m.type === 'saida' ? 'badge-red' : 'badge-gray'}>
                      {m.type === 'entrada' ? '↑' : m.type === 'saida' ? '↓' : '~'} {m.type}
                    </span>
                  </td>
                  <td className="font-mono">{m.quantity} {ing.unit}</td>
                  <td className="text-[var(--text-3)]">{m.reason ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

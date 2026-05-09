import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Package, AlertTriangle, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Estoque' }

export default async function EstoquePage() {
  const supabase = createClient()
  const { data: ingredients } = await supabase
    .from('ingredients')
    .select('*')
    .eq('active', true)
    .order('name')

  const all = ingredients ?? []
  const critical = all.filter(i => i.stock_quantity <= i.min_stock)
  const ok = all.filter(i => i.stock_quantity > i.min_stock)
  const totalValue = all.reduce((s, i) => s + i.stock_quantity * i.cost_per_unit, 0)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Controle de Estoque</h1>
        <Link href="/ingredientes/novo" className="btn-primary">+ Novo Ingrediente</Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center border-l-4 border-green-500">
          <p className="text-2xl font-display font-bold text-neutral-900">{ok.length}</p>
          <p className="text-sm text-neutral-500 mt-1">Em dia</p>
        </div>
        <div className="card p-4 text-center border-l-4 border-red-500">
          <p className="text-2xl font-display font-bold text-red-500">{critical.length}</p>
          <p className="text-sm text-neutral-500 mt-1 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Crítico
          </p>
        </div>
        <div className="card p-4 text-center border-l-4 border-blue-500">
          <p className="text-2xl font-display font-bold text-neutral-900">{formatCurrency(totalValue)}</p>
          <p className="text-sm text-neutral-500 mt-1">Valor em Estoque</p>
        </div>
      </div>

      {/* Critical */}
      {critical.length > 0 && (
        <div className="card overflow-hidden border-red-200">
          <div className="px-5 py-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="font-semibold text-red-700">Ingredientes Críticos ({critical.length})</h3>
          </div>
          <table className="table">
            <thead><tr><th>Ingrediente</th><th>Estoque Atual</th><th>Mínimo</th><th>Valor</th><th></th></tr></thead>
            <tbody>
              {critical.map(i => (
                <tr key={i.id}>
                  <td className="font-medium text-neutral-900">{i.name}</td>
                  <td><span className="badge-red font-mono">{i.stock_quantity} {i.unit}</span></td>
                  <td className="font-mono text-sm text-neutral-500">{i.min_stock} {i.unit}</td>
                  <td>{formatCurrency(i.stock_quantity * i.cost_per_unit)}</td>
                  <td>
                    <div className="flex gap-2 justify-end">
                      <Link href={`/ingredientes/${i.id}`} className="btn-ghost text-xs py-1 px-2">Movimentar</Link>
                      <Link href={`/compras/nova`} className="btn-primary text-xs py-1 px-2">Comprar</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Full stock table */}
      <div className="table-container">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-800">Todos os Ingredientes</h3>
        </div>
        <table className="table">
          <thead>
            <tr><th>Ingrediente</th><th>Categoria</th><th>Estoque</th><th>Mínimo</th><th>Custo/Un.</th><th>Valor Total</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {all.map(i => {
              const low = i.stock_quantity <= i.min_stock
              const pct = i.min_stock > 0 ? Math.min((i.stock_quantity / i.min_stock) * 100, 200) : 100
              return (
                <tr key={i.id}>
                  <td className="font-medium text-neutral-900">{i.name}</td>
                  <td className="text-neutral-500">{i.category ?? '—'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm ${low ? 'text-red-600 font-bold' : 'text-neutral-700'}`}>
                        {i.stock_quantity} {i.unit}
                      </span>
                      <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct < 50 ? 'bg-red-400' : pct < 100 ? 'bg-yellow-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-sm text-neutral-500">{i.min_stock} {i.unit}</td>
                  <td>{formatCurrency(i.cost_per_unit)}</td>
                  <td className="font-semibold">{formatCurrency(i.stock_quantity * i.cost_per_unit)}</td>
                  <td><span className={low ? 'badge-red' : 'badge-green'}>{low ? 'Crítico' : 'OK'}</span></td>
                  <td>
                    <Link href={`/ingredientes/${i.id}`} className="btn-ghost text-xs py-1 px-2">Editar</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

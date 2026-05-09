import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Financeiro' }

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: { mes?: string; tipo?: string }
}) {
  const supabase = createClient()

  const now = new Date()
  const mesParam = searchParams.mes ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, month] = mesParam.split('-').map(Number)
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  const tipo = searchParams.tipo ?? ''

  let query = supabase
    .from('cashflow_entries')
    .select('*', { count: 'exact' })
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (tipo) query = query.eq('type', tipo)

  const { data: entries, count } = await query

  const receitas = (entries ?? []).filter(e => e.type === 'receita' && e.paid).reduce((s, e) => s + e.amount, 0)
  const despesas = (entries ?? []).filter(e => e.type === 'despesa' && e.paid).reduce((s, e) => s + e.amount, 0)
  const receitasPendentes = (entries ?? []).filter(e => e.type === 'receita' && !e.paid).reduce((s, e) => s + e.amount, 0)
  const despesasPendentes = (entries ?? []).filter(e => e.type === 'despesa' && !e.paid).reduce((s, e) => s + e.amount, 0)
  const lucro = receitas - despesas

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Financeiro</h1>
        <Link href="/financeiro/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Lançamento
        </Link>
      </div>

      {/* Period selector */}
      <div className="card p-4">
        <form className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label text-xs">Mês</label>
            <input type="month" name="mes" defaultValue={mesParam} className="input" />
          </div>
          <div>
            <label className="label text-xs">Tipo</label>
            <select name="tipo" defaultValue={tipo} className="input">
              <option value="">Todos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Filtrar</button>
        </form>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-xs text-[var(--text-3)]">Receitas Recebidas</p>
          </div>
          <p className="text-xl font-display font-bold text-green-600">{formatCurrency(receitas)}</p>
          {receitasPendentes > 0 && <p className="text-xs text-[var(--muted)] mt-1">+ {formatCurrency(receitasPendentes)} pendente</p>}
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <p className="text-xs text-[var(--text-3)]">Despesas Pagas</p>
          </div>
          <p className="text-xl font-display font-bold text-red-600">{formatCurrency(despesas)}</p>
          {despesasPendentes > 0 && <p className="text-xs text-[var(--muted)] mt-1">+ {formatCurrency(despesasPendentes)} pendente</p>}
        </div>
        <div className={`card p-4 border-l-4 ${lucro >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className={`w-4 h-4 ${lucro >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <p className="text-xs text-[var(--text-3)]">Lucro Líquido</p>
          </div>
          <p className={`text-xl font-display font-bold ${lucro >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatCurrency(lucro)}
          </p>
        </div>
        <div className="card p-4 border-l-4 border-neutral-300">
          <p className="text-xs text-[var(--text-3)] mb-1">Lançamentos</p>
          <p className="text-xl font-display font-bold text-[var(--text-1)]">{count ?? 0}</p>
          <p className="text-xs text-[var(--muted)] mt-1">no período</p>
        </div>
      </div>

      {/* Entries table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(entries ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[var(--muted)]">
                  Nenhum lançamento neste período
                </td>
              </tr>
            ) : (
              (entries ?? []).map((e: any) => (
                <tr key={e.id}>
                  <td>{formatDate(e.date)}</td>
                  <td className="font-medium text-[var(--text-1)]">{e.description}</td>
                  <td><span className="badge-gray">{e.category}</span></td>
                  <td>
                    <span className={e.type === 'receita' ? 'badge-green' : 'badge-red'}>
                      {e.type === 'receita' ? '↑ Receita' : '↓ Despesa'}
                    </span>
                  </td>
                  <td className={`font-semibold ${e.type === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                    {e.type === 'receita' ? '+' : '-'}{formatCurrency(e.amount)}
                  </td>
                  <td>
                    <span className={e.paid ? 'badge-green' : 'badge-yellow'}>
                      {e.paid ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td>
                    <Link href={`/financeiro/${e.id}/editar`} className="btn-ghost text-xs py-1 px-2">Editar</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

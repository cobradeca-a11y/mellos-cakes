import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { deleteOperationalExpense } from './actions'
import { Plus, ReceiptText, TrendingDown, Clock3, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Despesas Operacionais' }

const STOCK_BLOCK_START = '--- DADOS DE ESTOQUE ---'
const STOCK_BLOCK_END = '--- FIM DADOS DE ESTOQUE ---'

function splitNotes(notes?: string | null) {
  const raw = notes ?? ''
  const start = raw.indexOf(STOCK_BLOCK_START)
  const end = raw.indexOf(STOCK_BLOCK_END)

  if (start === -1 || end === -1 || end < start) {
    return { baseNotes: raw.trim(), stockLines: [] as string[] }
  }

  return {
    baseNotes: `${raw.slice(0, start)}${raw.slice(end + STOCK_BLOCK_END.length)}`.trim(),
    stockLines: raw
      .slice(start + STOCK_BLOCK_START.length, end)
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean),
  }
}

export default async function DespesasOperacionaisPage({
  searchParams,
}: {
  searchParams: { mes?: string; categoria?: string; status?: string }
}) {
  const supabase = createClient()

  const now = new Date()
  const mesParam = searchParams.mes ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, month] = mesParam.split('-').map(Number)
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  const categoria = searchParams.categoria ?? ''
  const status = searchParams.status ?? ''

  let query = supabase
    .from('cashflow_entries')
    .select('*', { count: 'exact' })
    .eq('type', 'despesa')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (categoria) query = query.eq('category', categoria)
  if (status === 'pago') query = query.eq('paid', true)
  if (status === 'pendente') query = query.eq('paid', false)

  const { data: expenses, count } = await query

  const paidTotal = (expenses ?? []).filter(e => e.paid).reduce((sum, e) => sum + Number(e.amount), 0)
  const pendingTotal = (expenses ?? []).filter(e => !e.paid).reduce((sum, e) => sum + Number(e.amount), 0)
  const categories = Array.from(new Set((expenses ?? []).map(e => e.category).filter(Boolean))).sort()

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Despesas Operacionais</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">
            Gastos da operação que não são ingredientes de receita.
          </p>
        </div>
        <Link href="/despesas-operacionais/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Nova Despesa
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <p className="text-xs text-[var(--text-3)]">Pagas</p>
          </div>
          <p className="text-xl font-display font-bold text-red-600">{formatCurrency(paidTotal)}</p>
        </div>
        <div className="card p-4 border-l-4 border-yellow-500">
          <div className="flex items-center gap-2 mb-1">
            <Clock3 className="w-4 h-4 text-yellow-600" />
            <p className="text-xs text-[var(--text-3)]">Pendentes</p>
          </div>
          <p className="text-xl font-display font-bold text-yellow-600">{formatCurrency(pendingTotal)}</p>
        </div>
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-1">
            <ReceiptText className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-[var(--text-3)]">Total do período</p>
          </div>
          <p className="text-xl font-display font-bold text-blue-600">{formatCurrency(paidTotal + pendingTotal)}</p>
        </div>
        <div className="card p-4 border-l-4 border-neutral-300">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-[var(--text-3)]" />
            <p className="text-xs text-[var(--text-3)]">Lançamentos</p>
          </div>
          <p className="text-xl font-display font-bold text-[var(--text-1)]">{count ?? 0}</p>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <form className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label text-xs">Mês exibido</label>
            <input type="month" name="mes" defaultValue={mesParam} className="input" />
          </div>
          <div>
            <label className="label text-xs">Categoria</label>
            <select name="categoria" defaultValue={categoria} className="input">
              <option value="">Todas</option>
              {categories.map(category => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Status</label>
            <select name="status" defaultValue={status} className="input">
              <option value="">Todos</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Filtrar</button>
        </form>
        <p className="text-xs text-[var(--text-3)]">
          A lista mostra as despesas do mês filtrado. Ao editar a data, o app retorna automaticamente para o mês da compra.
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Estoque/controle</th>
              <th>Pagamento</th>
              <th>Valor</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(expenses ?? []).length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[var(--muted)]">
                  <ReceiptText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma despesa operacional encontrada</p>
                </td>
              </tr>
            ) : (
              (expenses ?? []).map((expense: any) => {
                const { baseNotes, stockLines } = splitNotes(expense.notes)
                return (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.date)}</td>
                    <td>
                      <p className="font-medium text-[var(--text-1)]">{expense.description}</p>
                      {baseNotes && <p className="text-xs text-[var(--text-3)] mt-0.5">{baseNotes}</p>}
                    </td>
                    <td><span className="badge-gray">{expense.category}</span></td>
                    <td>
                      {stockLines.length > 0 ? (
                        <div className="space-y-0.5 text-xs text-[var(--text-3)]">
                          {stockLines.map(line => <p key={line}>{line}</p>)}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="capitalize text-[var(--text-2)]">{expense.payment_method?.replaceAll('_', ' ') ?? '—'}</td>
                    <td className="font-semibold text-red-500">-{formatCurrency(expense.amount)}</td>
                    <td>
                      <span className={expense.paid ? 'badge-green' : 'badge-yellow'}>
                        {expense.paid ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <Link href={`/despesas-operacionais/${expense.id}/editar`} className="btn-ghost text-xs py-1 px-2">Editar</Link>
                        <DeleteButton
                          action={deleteOperationalExpense.bind(null, expense.id)}
                          confirmMessage={`Excluir a despesa "${expense.description}"? Esta ação não pode ser desfeita.`}
                        />
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

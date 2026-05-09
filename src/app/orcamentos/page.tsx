import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, FileText } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Orçamentos' }

const statusBadge: Record<string, string> = {
  rascunho: 'badge-gray',
  enviado: 'badge-blue',
  aprovado: 'badge-green',
  recusado: 'badge-red',
  expirado: 'badge-yellow',
}

export default async function OrcamentosPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = createClient()
  const status = searchParams.status ?? ''

  let query = supabase
    .from('quotes')
    .select('*, customers(name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: quotes, count } = await query

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orçamentos</h1>
<<<<<<< HEAD
          <p className="text-sm text-neutral-500 mt-0.5">{count ?? 0} orçamentos</p>
=======
          <p className="text-sm text-[var(--text-3)] mt-0.5">{count ?? 0} orçamentos</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
        </div>
        <Link href="/orcamentos/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Orçamento
        </Link>
      </div>

      <div className="card p-4">
        <form className="flex gap-3">
          <select name="status" defaultValue={status} className="input w-auto">
            <option value="">Todos</option>
            {['rascunho','enviado','aprovado','recusado','expirado'].map(s =>
              <option key={s} value={s}>{s}</option>
            )}
          </select>
          <button type="submit" className="btn-primary">Filtrar</button>
        </form>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Número</th><th>Cliente</th><th>Status</th><th>Válido até</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {(quotes ?? []).length === 0 ? (
              <tr>
<<<<<<< HEAD
                <td colSpan={6} className="text-center py-12 text-neutral-400">
=======
                <td colSpan={6} className="text-center py-12 text-[var(--muted)]">
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum orçamento encontrado</p>
                </td>
              </tr>
            ) : (
              (quotes ?? []).map((q: any) => (
                <tr key={q.id}>
                  <td className="font-mono text-sm font-medium">#{q.quote_number}</td>
<<<<<<< HEAD
                  <td className="font-medium text-neutral-900">{q.customers?.name ?? '—'}</td>
=======
                  <td className="font-medium text-[var(--text-1)]">{q.customers?.name ?? '—'}</td>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
                  <td><span className={statusBadge[q.status] ?? 'badge-gray'}>{q.status}</span></td>
                  <td>{q.valid_until ? formatDate(q.valid_until) : '—'}</td>
                  <td className="font-semibold">{formatCurrency(q.total_amount)}</td>
                  <td>
                    <div className="flex gap-2 justify-end">
                      <Link href={`/orcamentos/${q.id}`} className="btn-ghost text-xs py-1 px-2">Ver</Link>
                      {q.status === 'aprovado' && (
                        <ConvertButton quoteId={q.id} />
                      )}
                    </div>
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

function ConvertButton({ quoteId }: { quoteId: string }) {
  return (
    <Link href={`/pedidos/novo?orcamento=${quoteId}`} className="btn-primary text-xs py-1 px-2">
      → Pedido
    </Link>
  )
}

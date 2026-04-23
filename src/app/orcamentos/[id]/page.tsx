import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Send } from 'lucide-react'
import { updateQuoteStatus } from '../actions'

const statusBadge: Record<string,string> = {
  rascunho:'badge-gray',enviado:'badge-blue',aprovado:'badge-green',recusado:'badge-red',expirado:'badge-yellow'
}

export default async function OrcamentoDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: quote } = await supabase
    .from('quotes')
    .select('*, customers(name, phone, email)')
    .eq('id', params.id)
    .single()

  if (!quote) notFound()

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/orcamentos" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="page-title font-mono">#{quote.quote_number}</h1>
            <p className="text-sm text-neutral-500">{(quote.customers as any)?.name ?? 'Sem cliente'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {quote.status === 'rascunho' && (
            <form action={updateQuoteStatus.bind(null, params.id, 'enviado')}>
              <button type="submit" className="btn-secondary text-sm"><Send className="w-4 h-4" /> Enviar</button>
            </form>
          )}
          {quote.status === 'enviado' && (
            <>
              <form action={updateQuoteStatus.bind(null, params.id, 'aprovado')}>
                <button type="submit" className="btn-primary text-sm"><CheckCircle className="w-4 h-4" /> Aprovar</button>
              </form>
              <form action={updateQuoteStatus.bind(null, params.id, 'recusado')}>
                <button type="submit" className="btn-danger text-sm"><XCircle className="w-4 h-4" /> Recusar</button>
              </form>
            </>
          )}
          {quote.status === 'aprovado' && (
            <Link href={`/pedidos/novo?orcamento=${params.id}`} className="btn-primary text-sm">
              Converter em Pedido →
            </Link>
          )}
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Status</p>
            <span className={statusBadge[quote.status]}>{quote.status}</span>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Total</p>
            <p className="font-bold text-brand-500">{formatCurrency(quote.total_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Sinal</p>
            <p className="font-semibold">{formatCurrency(quote.deposit_required ?? 0)}</p>
          </div>
          {quote.valid_until && (
            <div>
              <p className="text-xs text-neutral-500 mb-1">Válido até</p>
              <p className="font-semibold">{formatDate(quote.valid_until)}</p>
            </div>
          )}
        </div>
        {quote.notes && (
          <div className="pt-3 border-t border-neutral-100">
            <p className="text-xs text-neutral-500 mb-1">Detalhes</p>
            <p className="text-sm text-neutral-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}
      </div>

      {quote.customers && (
        <div className="card p-5">
          <h3 className="font-semibold text-neutral-800 mb-3">Cliente</h3>
          <p className="font-medium text-neutral-900">{(quote.customers as any).name}</p>
          {(quote.customers as any).phone && <p className="text-sm text-neutral-500">{(quote.customers as any).phone}</p>}
          {(quote.customers as any).email && <p className="text-sm text-neutral-500">{(quote.customers as any).email}</p>}
        </div>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { createQuote } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Novo Orçamento' }

export default async function NovoOrcamentoPage() {
  const supabase = createClient()
  const { data: customers } = await supabase.from('customers').select('id,name').eq('active', true).order('name')

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/orcamentos" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Novo Orçamento</h1>
      </div>
      <form action={createQuote} className="card p-6 space-y-4">
        <div>
          <label className="label">Cliente</label>
          <select name="customer_id" className="input">
            <option value="">Selecione</option>
            {(customers ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Valor Total (R$) *</label>
            <input type="number" step="0.01" min="0" name="total_amount" required className="input" />
          </div>
          <div>
            <label className="label">Sinal Requerido (R$)</label>
            <input type="number" step="0.01" min="0" name="deposit_required" defaultValue="0" className="input" />
          </div>
          <div>
            <label className="label">Válido até</label>
            <input type="date" name="valid_until" className="input" />
          </div>
        </div>
        <div>
          <label className="label">Observações / Detalhes do Pedido</label>
          <textarea name="notes" rows={4} className="input resize-none" placeholder="Descreva o que o cliente deseja..." />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">Criar Orçamento</button>
        </div>
      </form>
    </div>
  )
}

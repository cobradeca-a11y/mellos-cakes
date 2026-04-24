'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton({ label = 'Salvar Pedido' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : label}
    </button>
  )
}

interface OrderFormProps {
  action: (fd: FormData) => Promise<void>
  customers: { id: string; name: string }[]
  defaultCustomerId?: string
  defaultValues?: Record<string, any>
}

const PAYMENT_METHODS = ['pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'transferencia']
const STATUS_OPTS = ['orcamento','confirmado','em_producao','finalizado','entregue','cancelado']

export function OrderForm({ action, customers, defaultCustomerId, defaultValues = {} }: OrderFormProps) {
  return (
    <form action={action} className="space-y-5">
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Dados do Pedido</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Cliente</label>
            <select name="customer_id" className="input" defaultValue={defaultCustomerId ?? defaultValues.customer_id ?? ''}>
              <option value="">Selecione um cliente</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {defaultValues.status !== undefined && (
            <div>
              <label className="label">Status</label>
              <select name="status" className="input" defaultValue={defaultValues.status}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Data de Entrega *</label>
            <input type="datetime-local" name="delivery_date" required
              defaultValue={defaultValues.delivery_date ? new Date(defaultValues.delivery_date).toISOString().slice(0,16) : ''}
              className="input" />
          </div>
          <div>
            <label className="label">Forma de Pagamento</label>
            <select name="payment_method" className="input" defaultValue={defaultValues.payment_method ?? ''}>
              <option value="">Selecione</option>
              {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p.replace('_',' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Financeiro</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Valor Total (R$) *</label>
            <input type="number" step="0.01" min="0" name="total_amount" required
              defaultValue={defaultValues.total_amount ?? ''}
              placeholder="0,00" className="input" />
          </div>
          <div>
            <label className="label">Sinal Pago (R$)</label>
            <input type="number" step="0.01" min="0" name="deposit_paid"
              defaultValue={defaultValues.deposit_paid ?? '0'}
              placeholder="0,00" className="input" />
          </div>
          <div>
            <label className="label">Custo Estimado (R$)</label>
            <input type="number" step="0.01" min="0" name="estimated_cost"
              defaultValue={defaultValues.estimated_cost ?? '0'}
              placeholder="0,00" className="input" />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Observações</h3>
        <textarea name="notes" rows={4}
          defaultValue={defaultValues.notes ?? ''}
          placeholder="Detalhes do pedido, customizações, tema, cores, recheios, etc..."
          className="input resize-none" />
      </div>

      <div className="flex justify-end gap-3">
        <SubmitButton />
      </div>
    </form>
  )
}

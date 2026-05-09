'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Despesa'}
    </button>
  )
}

const CATEGORIES = [
  'Descartáveis',
  'Gás de cozinha',
  'Combustível',
  'Embalagens',
  'Limpeza',
  'Energia elétrica',
  'Água',
  'Manutenção',
  'Entrega/Frete',
  'Taxas',
  'Equipamentos',
  'Outros',
]

const PAYMENTS = ['pix','dinheiro','cartao_credito','cartao_debito','transferencia','vr','outros']

export function OperationalExpenseForm({
  action,
  defaultValues = {},
}: {
  action: (fd: FormData) => Promise<void>
  defaultValues?: Record<string, any>
}) {
  return (
    <form action={action} className="space-y-5">
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Despesa Operacional</h3>
        <p className="text-sm text-[var(--text-3)]">
          Use esta tela para gastos que não são ingredientes da receita, mas fazem parte da operação da Mello's Cakes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Data *</label>
            <input
              type="date"
              name="date"
              required
              defaultValue={defaultValues.date ?? new Date().toISOString().split('T')[0]}
              className="input"
            />
          </div>

          <div>
            <label className="label">Categoria *</label>
            <input name="category" required list="operational-expense-categories" defaultValue={defaultValues.category ?? ''} className="input" />
            <datalist id="operational-expense-categories">
              {CATEGORIES.map(category => <option key={category} value={category} />)}
            </datalist>
          </div>

          <div className="md:col-span-2">
            <label className="label">Descrição *</label>
            <input
              name="description"
              required
              defaultValue={defaultValues.description ?? ''}
              placeholder="Ex: compra de descartáveis, botijão de gás, combustível para entrega..."
              className="input"
            />
          </div>

          <div>
            <label className="label">Valor (R$) *</label>
            <input type="number" step="0.01" min="0" name="amount" required defaultValue={defaultValues.amount ?? ''} className="input" />
          </div>

          <div>
            <label className="label">Forma de pagamento</label>
            <select name="payment_method" className="input" defaultValue={defaultValues.payment_method ?? ''}>
              <option value="">Selecione</option>
              {PAYMENTS.map(payment => <option key={payment} value={payment}>{payment.replaceAll('_', ' ')}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select name="paid" className="input" defaultValue={defaultValues.paid === false ? 'false' : 'true'}>
              <option value="true">Pago</option>
              <option value="false">Pendente</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">Observações</label>
            <textarea name="notes" rows={3} defaultValue={defaultValues.notes ?? ''} className="input resize-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  )
}

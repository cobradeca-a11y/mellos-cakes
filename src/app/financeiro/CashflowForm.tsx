'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Lançamento'}
    </button>
  )
}

const RECEITA_CATS = ['Venda de Produto','Sinal de Pedido','Pagamento de Pedido','Serviço','Outros']
const DESPESA_CATS = ['Ingredientes','Embalagens','Equipamentos','Aluguel','Marketing','Transporte','Taxas','Outros']
const PAYMENTS = ['pix','dinheiro','cartao_credito','cartao_debito','transferencia']

export function CashflowForm({ action, defaultValues = {} }: { action: (fd: FormData) => Promise<void>; defaultValues?: Record<string, any> }) {
  return (
    <form action={action} className="card p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Tipo *</label>
          <select name="type" required className="input" defaultValue={defaultValues.type ?? 'receita'}>
            <option value="receita">↑ Receita</option>
            <option value="despesa">↓ Despesa</option>
          </select>
        </div>
        <div>
          <label className="label">Data *</label>
          <input type="date" name="date" required
            defaultValue={defaultValues.date ?? new Date().toISOString().split('T')[0]}
            className="input" />
        </div>
        <div className="col-span-2">
          <label className="label">Descrição *</label>
          <input name="description" required defaultValue={defaultValues.description ?? ''} className="input" />
        </div>
        <div>
          <label className="label">Categoria *</label>
          <input name="category" required list="cats" defaultValue={defaultValues.category ?? ''} className="input" />
          <datalist id="cats">
            {[...RECEITA_CATS, ...DESPESA_CATS].map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className="label">Valor (R$) *</label>
          <input type="number" step="0.01" min="0" name="amount" required defaultValue={defaultValues.amount ?? ''} className="input" />
        </div>
        <div>
          <label className="label">Forma de Pagamento</label>
          <select name="payment_method" className="input" defaultValue={defaultValues.payment_method ?? ''}>
            <option value="">Selecione</option>
            {PAYMENTS.map(p => <option key={p} value={p}>{p.replace('_',' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="paid" className="input" defaultValue={defaultValues.paid ? 'true' : 'false'}>
            <option value="true">Pago / Recebido</option>
            <option value="false">Pendente</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Observações</label>
          <textarea name="notes" rows={2} defaultValue={defaultValues.notes ?? ''} className="input resize-none" />
        </div>
      </div>
      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  )
}

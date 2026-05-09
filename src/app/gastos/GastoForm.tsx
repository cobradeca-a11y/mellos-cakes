'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Registrar Gasto'}
    </button>
  )
}

const CATEGORIAS = [
  { group: '🔥 Utilidades', items: ['Gás de cozinha P13', 'Gás de cozinha P45', 'Energia elétrica', 'Água'] },
  { group: '🚗 Transporte', items: ['Combustível', 'Uber/Táxi', 'Manutenção do veículo', 'Estacionamento'] },
  { group: '📦 Embalagens', items: ['Caixas de bolo', 'Caixas de doces', 'Sacos/sacolas', 'Fitas e laços', 'Papel manteiga', 'Filme PVC'] },
  { group: '🍴 Descartáveis', items: ['Talheres descartáveis', 'Pratos descartáveis', 'Copos descartáveis', 'Guardanapos'] },
  { group: '🧹 Limpeza', items: ['Produtos de limpeza', 'Álcool/desinfetante', 'Luvas descartáveis'] },
  { group: '📋 Outros', items: ['Manutenção de equipamentos', 'Material de escritório', 'Taxa/imposto', 'Outros'] },
]

const PAYMENTS = ['pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'transferencia']

export function GastoForm({ action }: { action: (fd: FormData) => Promise<void> }) {
  return (
    <form action={action} className="card p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Categoria *</label>
          <select name="category" required className="input">
            <option value="">Selecione a categoria</option>
            {CATEGORIAS.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map(i => <option key={i} value={i}>{i}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Descrição *</label>
          <input name="description" required placeholder="Ex: Gás P13 — botijão cheio" className="input" />
        </div>
        <div>
          <label className="label">Valor (R$) *</label>
          <input type="number" step="0.01" min="0" name="amount" required placeholder="0,00" className="input" />
        </div>
        <div>
          <label className="label">Data *</label>
          <input type="date" name="date" required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="input" />
        </div>
        <div>
          <label className="label">Forma de Pagamento</label>
          <select name="payment_method" className="input">
            <option value="">Selecione</option>
            {PAYMENTS.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="paid" className="input" defaultValue="true">
            <option value="true">Pago</option>
            <option value="false">Pendente</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Observações</label>
          <textarea name="notes" rows={2} placeholder="Detalhes adicionais..." className="input resize-none" />
        </div>
      </div>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}

'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Ingrediente'}
    </button>
  )
}

const UNITS = ['g','kg','ml','L','unidade','colher_sopa','colher_cha','xicara','pacote','caixa']
const CATEGORIES = ['Farinhas','Açúcares','Laticínios','Ovos','Gorduras','Chocolate','Frutas','Aromatizantes','Corantes','Embalagens','Outros']

interface IngredientFormProps {
  action: (fd: FormData) => Promise<void>
  suppliers: { id: string; name: string }[]
  defaultValues?: Record<string, any>
}

export function IngredientForm({ action, suppliers, defaultValues = {} }: IngredientFormProps) {
  return (
    <form action={action} className="space-y-5">
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-neutral-800">Identificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Nome *</label>
            <input name="name" required defaultValue={defaultValues.name} placeholder="Ex: Farinha de Trigo" className="input" />
          </div>
          <div>
            <label className="label">Categoria</label>
            <select name="category" className="input" defaultValue={defaultValues.category ?? ''}>
              <option value="">Selecione</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Fornecedor Principal</label>
            <select name="supplier_id" className="input" defaultValue={defaultValues.supplier_id ?? ''}>
              <option value="">Nenhum</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-neutral-800">Estoque & Custo</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Unidade de Medida *</label>
            <select name="unit" required className="input" defaultValue={defaultValues.unit ?? 'kg'}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Custo por Unidade (R$)</label>
            <input type="number" step="0.001" min="0" name="cost_per_unit"
              defaultValue={defaultValues.cost_per_unit ?? '0'} className="input" />
          </div>
          <div>
            <label className="label">Qtd. em Estoque</label>
            <input type="number" step="0.001" min="0" name="stock_quantity"
              defaultValue={defaultValues.stock_quantity ?? '0'} className="input" />
          </div>
          <div>
            <label className="label">Estoque Mínimo</label>
            <input type="number" step="0.001" min="0" name="min_stock"
              defaultValue={defaultValues.min_stock ?? '0'} className="input" />
          </div>
          <div>
            <label className="label">Validade</label>
            <input type="date" name="expiry_date" defaultValue={defaultValues.expiry_date ?? ''} className="input" />
          </div>
          <div>
            <label className="label">Lote (opcional)</label>
            <input name="lot" defaultValue={defaultValues.lot ?? ''} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Observações</label>
          <textarea name="notes" rows={2} defaultValue={defaultValues.notes ?? ''} className="input resize-none" />
        </div>
      </div>

      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  )
}

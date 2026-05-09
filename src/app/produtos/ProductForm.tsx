'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Produto'}
    </button>
  )
}

interface Props {
  action: (fd: FormData) => Promise<void>
  categories: { id: string; name: string }[]
  defaultValues?: Record<string, any>
}

export function ProductForm({ action, categories, defaultValues = {} }: Props) {
  return (
    <form action={action} className="space-y-5">
      <div className="card p-6 space-y-4">
<<<<<<< HEAD
        <h3 className="font-semibold text-neutral-800">Informações do Produto</h3>
=======
        <h3 className="font-semibold text-[var(--text-1)]">Informações do Produto</h3>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Nome *</label>
            <input name="name" required defaultValue={defaultValues.name} className="input" />
          </div>
          <div>
            <label className="label">Categoria</label>
            <select name="category_id" className="input" defaultValue={defaultValues.category_id ?? ''}>
              <option value="">Sem categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Prazo Mínimo (dias) *</label>
            <input type="number" min="1" name="min_production_days" required
              defaultValue={defaultValues.min_production_days ?? '3'} className="input" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Descrição</label>
            <textarea name="description" rows={3} defaultValue={defaultValues.description ?? ''} className="input resize-none" />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
<<<<<<< HEAD
        <h3 className="font-semibold text-neutral-800">Preço & Disponibilidade</h3>
=======
        <h3 className="font-semibold text-[var(--text-1)]">Preço & Disponibilidade</h3>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Preço Base (R$) *</label>
            <input type="number" step="0.01" min="0" name="base_price" required
              defaultValue={defaultValues.base_price ?? ''} className="input" />
          </div>
          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="hidden" name="available" value="false" />
              <input type="checkbox" name="available" value="true"
                defaultChecked={defaultValues.available !== false}
                className="w-4 h-4 accent-brand-500" />
<<<<<<< HEAD
              <span className="text-sm font-medium text-neutral-700">Disponível para venda</span>
=======
              <span className="text-sm font-medium text-[var(--text-2)]">Disponível para venda</span>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="hidden" name="featured" value="false" />
              <input type="checkbox" name="featured" value="true"
                defaultChecked={defaultValues.featured === true}
                className="w-4 h-4 accent-brand-500" />
<<<<<<< HEAD
              <span className="text-sm font-medium text-neutral-700">Destaque no catálogo</span>
=======
              <span className="text-sm font-medium text-[var(--text-2)]">Destaque no catálogo</span>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  )
}

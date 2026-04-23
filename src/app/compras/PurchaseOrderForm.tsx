'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Criar Pedido de Compra'}
    </button>
  )
}

interface Item { ingredient_id: string; quantity: number; unit_price: number; total_price: number }
interface Props {
  action: (fd: FormData) => Promise<void>
  suppliers: { id: string; name: string }[]
  ingredients: { id: string; name: string; unit: string; cost_per_unit: number }[]
}

export function PurchaseOrderForm({ action, suppliers, ingredients }: Props) {
  const [items, setItems] = useState<Item[]>([{ ingredient_id: '', quantity: 0, unit_price: 0, total_price: 0 }])

  const addItem = () => setItems(p => [...p, { ingredient_id: '', quantity: 0, unit_price: 0, total_price: 0 }])
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i))

  const updateItem = (i: number, field: keyof Item, value: any) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item
      const updated = { ...item, [field]: value }
      if (field === 'ingredient_id') {
        const ing = ingredients.find(x => x.id === value)
        updated.unit_price = ing?.cost_per_unit ?? 0
      }
      updated.total_price = updated.quantity * updated.unit_price
      return updated
    }))
  }

  const total = items.reduce((s, i) => s + i.total_price, 0)

  return (
    <form action={(fd) => {
      const valid = items.filter(i => i.ingredient_id && i.quantity > 0)
      fd.set('items', JSON.stringify(valid))
      return action(fd)
    }} className="space-y-5">
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-neutral-800">Dados da Compra</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Fornecedor</label>
            <select name="supplier_id" className="input">
              <option value="">Selecione</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Previsão de Entrega</label>
            <input type="date" name="expected_delivery" className="input" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Observações</label>
            <textarea name="notes" rows={2} className="input resize-none" />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neutral-800">Itens</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">Total: <strong className="text-brand-500">{formatCurrency(total)}</strong></span>
            <button type="button" onClick={addItem} className="btn-ghost text-xs">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => {
            const ing = ingredients.find(x => x.id === item.ingredient_id)
            return (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <select value={item.ingredient_id} onChange={e => updateItem(i, 'ingredient_id', e.target.value)} className="input">
                    <option value="">Ingrediente</option>
                    {ingredients.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <input type="number" step="0.01" min="0" value={item.quantity || ''}
                    onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                    placeholder={ing?.unit ?? 'Qtd'} className="input" />
                </div>
                <div className="col-span-2">
                  <input type="number" step="0.001" min="0" value={item.unit_price || ''}
                    onChange={e => updateItem(i, 'unit_price', Number(e.target.value))}
                    placeholder="R$/un" className="input" />
                </div>
                <div className="col-span-2 text-sm font-semibold text-neutral-700 text-center">
                  {formatCurrency(item.total_price)}
                </div>
                <div className="col-span-1 flex justify-center">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2, Plus, Trash2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Receita'}
    </button>
  )
}

const RECIPE_CATEGORIES = ['Massa','Recheio','Cobertura','Decoração','Glacê','Complemento','Outro']
const UNITS = ['g','kg','ml','L','unidade','colher_sopa','colher_cha','xicara']

interface Ingredient { id: string; name: string; unit: string; cost_per_unit: number }
interface RecipeItem { ingredient_id: string; quantity: number; unit: string }
interface Props {
  action: (fd: FormData) => Promise<void>
  ingredients: Ingredient[]
  defaultValues?: Record<string, any>
  defaultItems?: RecipeItem[]
}

export function RecipeForm({ action, ingredients, defaultValues = {}, defaultItems = [] }: Props) {
  const [items, setItems] = useState<RecipeItem[]>(defaultItems.length > 0 ? defaultItems : [{ ingredient_id: '', quantity: 0, unit: 'g' }])

  const addItem = () => setItems(prev => [...prev, { ingredient_id: '', quantity: 0, unit: 'g' }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof RecipeItem, value: any) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const totalCost = items.reduce((sum, item) => {
    const ing = ingredients.find(i => i.id === item.ingredient_id)
    return sum + (ing?.cost_per_unit ?? 0) * item.quantity
  }, 0)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget)
    const validItems = items.filter(it => it.ingredient_id && it.quantity > 0)
    fd.set('items', JSON.stringify(validItems))
    return fd
  }

  return (
    <form
      action={(fd) => {
        const validItems = items.filter(it => it.ingredient_id && it.quantity > 0)
        fd.set('items', JSON.stringify(validItems))
        return action(fd)
      }}
      className="space-y-5"
    >
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Informações da Receita</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Nome *</label>
            <input name="name" required defaultValue={defaultValues.name} placeholder="Ex: Bolo de Chocolate" className="input" />
          </div>
          <div>
            <label className="label">Categoria</label>
            <select name="category" className="input" defaultValue={defaultValues.category ?? ''}>
              <option value="">Selecione</option>
              {RECIPE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tempo de Preparo (min)</label>
            <input type="number" name="prep_time_minutes" defaultValue={defaultValues.prep_time_minutes ?? ''} className="input" />
          </div>
          <div>
            <label className="label">Rendimento (quantidade)</label>
            <input type="number" step="0.1" name="yield_quantity" required defaultValue={defaultValues.yield_quantity ?? '1'} className="input" />
          </div>
          <div>
            <label className="label">Unidade do Rendimento</label>
            <select name="yield_unit" className="input" defaultValue={defaultValues.yield_unit ?? 'unidade'}>
              {['unidade','kg','g','L','ml','porção','fatia'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--text-1)]">Ingredientes</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-3)]">Custo total: <strong className="text-brand-500">R$ {totalCost.toFixed(2)}</strong></span>
            <button type="button" onClick={addItem} className="btn-ghost text-xs">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={item.ingredient_id}
                onChange={e => updateItem(i, 'ingredient_id', e.target.value)}
                className="input flex-1"
              >
                <option value="">Selecione ingrediente</option>
                {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
              </select>
              <input
                type="number" step="0.001" min="0"
                value={item.quantity}
                onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                placeholder="Qtd"
                className="input w-24"
              />
              <select
                value={item.unit}
                onChange={e => updateItem(i, 'unit', e.target.value)}
                className="input w-24"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Modo de Preparo & Notas</h3>
        <div>
          <label className="label">Modo de Preparo</label>
          <textarea name="instructions" rows={5} defaultValue={defaultValues.instructions ?? ''}
            placeholder="Descreva o passo a passo..." className="input resize-none" />
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

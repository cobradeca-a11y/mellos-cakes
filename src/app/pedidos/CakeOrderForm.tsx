'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

interface Size    { id: string; name: string; label: string; base_price: number; servings: number }
interface Flavor  { id: string; name: string }
interface Filling { id: string; name: string; category: string; has_surcharge: boolean; surcharge_p: number; surcharge_m: number; surcharge_g: number }
interface Topping { id: string; name: string; has_surcharge: boolean; surcharge_p: number; surcharge_m: number; surcharge_g: number }

interface CakeItem {
  sizeId: string; flavor1Id: string; flavor2Id: string
  filling1Id: string; filling2Id: string; toppingId: string
  qty: number; notes: string
}

interface Props {
  sizes: Size[]; flavors: Flavor[]; fillings: Filling[]; toppings: Topping[]
  onChange: (items: CakeItem[], total: number) => void
}

const empty = (): CakeItem => ({ sizeId:'', flavor1Id:'', flavor2Id:'', filling1Id:'', filling2Id:'', toppingId:'', qty:1, notes:'' })

function calcTotal(item: CakeItem, sizes: Size[], fillings: Filling[], toppings: Topping[]) {
  const size    = sizes.find(s => s.id === item.sizeId)
  if (!size) return 0
  const sKey    = size.name.toLowerCase() as 'p'|'m'|'g'
  const fill1   = fillings.find(f => f.id === item.filling1Id)
  const fill2   = fillings.find(f => f.id === item.filling2Id)
  const top     = toppings.find(t => t.id === item.toppingId)

  const f1Sur   = fill1?.has_surcharge ? (fill1[`surcharge_${sKey}`] ?? 0) : 0
  const f2Sur   = fill2?.has_surcharge ? (fill2[`surcharge_${sKey}`] ?? 0) : 0
  const topSur  = top?.has_surcharge   ? (top[`surcharge_${sKey}`]   ?? 0) : 0

  return (size.base_price + f1Sur + f2Sur + topSur) * item.qty
}

export function CakeOrderForm({ sizes, flavors, fillings, toppings, onChange }: Props) {
  const [items, setItems] = useState<CakeItem[]>([empty()])

  useEffect(() => {
    const total = items.reduce((s, item) => s + calcTotal(item, sizes, fillings, toppings), 0)
    onChange(items, total)
  }, [items])

  const update = (i: number, field: keyof CakeItem, value: any) => {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it))
  }

  const addItem  = () => setItems(prev => [...prev, empty()])
  const removeItem = (i: number) => setItems(prev => prev.filter((_,idx) => idx !== i))

  const groupedFillings = fillings.reduce((acc, f) => {
    const cat = f.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(f)
    return acc
  }, {} as Record<string, Filling[]>)

  const catLabels: Record<string,string> = {
    brigadeiro: 'Brigadeiro', beijinho: 'Beijinho', doce_de_leite: 'Doce de Leite', ninho: 'Ninho'
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const size    = sizes.find(s => s.id === item.sizeId)
        const total   = calcTotal(item, sizes, fillings, toppings)
        const sKey    = size?.name.toLowerCase() as 'p'|'m'|'g'

        return (
          <div key={i} className="card p-5 space-y-4" style={{ borderColor: item.sizeId ? 'var(--brand)' : 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
                Bolo {i + 1}
                {total > 0 && <span className="ml-2 text-brand-500">{formatCurrency(total)}</span>}
              </p>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Tamanho */}
              <div>
                <label className="label">Tamanho *</label>
                <div className="flex gap-2">
                  {sizes.map(s => (
                    <button key={s.id} type="button"
                      onClick={() => update(i, 'sizeId', s.id)}
                      className="flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all"
                      style={{
                        borderColor: item.sizeId === s.id ? 'var(--brand)' : 'var(--border)',
                        background:  item.sizeId === s.id ? 'rgba(229,92,40,0.1)' : 'var(--bg-card)',
                        color: item.sizeId === s.id ? 'var(--brand)' : 'var(--text-3)',
                      }}>
                      {s.name}
                    </button>
                  ))}
                </div>
                {size && (
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    ~{size.servings} fatias • base {formatCurrency(size.base_price)}
                  </p>
                )}
              </div>

              {/* Quantidade */}
              <div>
                <label className="label">Quantidade</label>
                <input type="number" min="1" max="99"
                  value={item.qty}
                  onChange={e => update(i, 'qty', Number(e.target.value))}
                  className="input" />
              </div>

              {/* Massa 1 */}
              <div>
                <label className="label">Massa 1 *</label>
                <select value={item.flavor1Id} onChange={e => update(i, 'flavor1Id', e.target.value)} className="input">
                  <option value="">Selecione</option>
                  {flavors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              {/* Massa 2 */}
              <div>
                <label className="label">Massa 2 (opcional)</label>
                <select value={item.flavor2Id} onChange={e => update(i, 'flavor2Id', e.target.value)} className="input">
                  <option value="">Apenas 1 sabor</option>
                  {flavors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Recheio 1 */}
              <div>
                <label className="label">Recheio 1 *</label>
                <select value={item.filling1Id} onChange={e => update(i, 'filling1Id', e.target.value)} className="input">
                  <option value="">Selecione</option>
                  {Object.entries(groupedFillings).map(([cat, fills]) => (
                    <optgroup key={cat} label={catLabels[cat] ?? cat}>
                      {fills.map(f => {
                        const sur = f.has_surcharge && sKey ? f[`surcharge_${sKey}` as keyof Filling] as number : 0
                        return <option key={f.id} value={f.id}>{f.name}{sur > 0 ? ` (+R$${sur})` : ''}</option>
                      })}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Recheio 2 */}
              <div>
                <label className="label">Recheio 2 (opcional)</label>
                <select value={item.filling2Id} onChange={e => update(i, 'filling2Id', e.target.value)} className="input">
                  <option value="">Apenas 1 recheio</option>
                  {Object.entries(groupedFillings).map(([cat, fills]) => (
                    <optgroup key={cat} label={catLabels[cat] ?? cat}>
                      {fills.map(f => {
                        const sur = f.has_surcharge && sKey ? f[`surcharge_${sKey}` as keyof Filling] as number : 0
                        return <option key={f.id} value={f.id}>{f.name}{sur > 0 ? ` (+R$${sur})` : ''}</option>
                      })}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Cobertura */}
              <div>
                <label className="label">Cobertura *</label>
                <select value={item.toppingId} onChange={e => update(i, 'toppingId', e.target.value)} className="input">
                  <option value="">Selecione</option>
                  {toppings.map(t => {
                    const sur = t.has_surcharge && sKey ? t[`surcharge_${sKey}` as keyof Topping] as number : 0
                    return <option key={t.id} value={t.id}>{t.name}{sur > 0 ? ` (+R$${sur})` : ''}</option>
                  })}
                </select>
              </div>
            </div>

            {/* Obs */}
            <div>
              <label className="label">Observações do bolo (tema, cores, mensagem...)</label>
              <input value={item.notes} onChange={e => update(i, 'notes', e.target.value)}
                placeholder="Ex: Tema unicórnio, tons de rosa, escrita 'Parabéns Ana'"
                className="input" />
            </div>

            {/* Resumo de acréscimos */}
            {size && (item.filling1Id || item.filling2Id || item.toppingId) && (() => {
              const f1 = fillings.find(f => f.id === item.filling1Id)
              const f2 = fillings.find(f => f.id === item.filling2Id)
              const tp = toppings.find(t => t.id === item.toppingId)
              const acrescimos = [
                f1?.has_surcharge ? { nome: f1.name, val: f1[`surcharge_${sKey}` as keyof Filling] as number } : null,
                f2?.has_surcharge ? { nome: f2.name, val: f2[`surcharge_${sKey}` as keyof Filling] as number } : null,
                tp?.has_surcharge ? { nome: tp.name, val: tp[`surcharge_${sKey}` as keyof Topping] as number } : null,
              ].filter(Boolean)

              if (acrescimos.length === 0) return null
              return (
                <div className="px-3 py-2 rounded-xl text-xs space-y-1"
                  style={{ background: 'rgba(229,92,40,0.06)', border: '1px solid rgba(229,92,40,0.2)' }}>
                  <p className="font-semibold" style={{ color: 'var(--brand)' }}>Acréscimos:</p>
                  {acrescimos.map((a: any) => (
                    <p key={a.nome} style={{ color: 'var(--text-3)' }}>+ {formatCurrency(a.val)} — {a.nome}</p>
                  ))}
                </div>
              )
            })()}
          </div>
        )
      })}

      <button type="button" onClick={addItem}
        className="btn-secondary w-full justify-center gap-2 py-3">
        <Plus className="w-4 h-4" /> Adicionar outro bolo
      </button>
    </div>
  )
}

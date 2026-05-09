'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

interface Size   { id: string; code: string; name: string; slices: number; base_price: number }
interface Flavor { id: string; name: string; type: string }
interface Surcharge { flavor_id: string; size_code: string; extra_price: number }

interface Props {
  sizes: Size[]
  massas: Flavor[]
  recheios: Flavor[]
  coberturas: Flavor[]
  surcharges: Surcharge[]
}

export function CakeSelector({ sizes, massas, recheios, coberturas, surcharges }: Props) {
  const [sizeCode, setSizeCode]     = useState('')
  const [mass1, setMass1]           = useState('')
  const [mass2, setMass2]           = useState('')
  const [filling1, setFilling1]     = useState('')
  const [filling2, setFilling2]     = useState('')
  const [topping, setTopping]       = useState('')

  const selectedSize = sizes.find(s => s.code === sizeCode)

  // Calcula acréscimo total
  const getSurcharge = (flavorName: string) => {
    const flavor = [...recheios, ...coberturas].find(f => f.name === flavorName)
    if (!flavor || !sizeCode) return 0
    const s = surcharges.find(s => s.flavor_id === flavor.id && s.size_code === sizeCode)
    return s?.extra_price ?? 0
  }

  const surchargeTotal = getSurcharge(filling1) + getSurcharge(filling2) + getSurcharge(topping)
  const basePrice      = selectedSize?.base_price ?? 0
  const totalPrice     = basePrice + surchargeTotal

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ color: 'var(--text-1)' }}>🎂 Configuração do Bolo</h3>
        {sizeCode && (
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Valor estimado</p>
            <p className="text-lg font-bold text-brand-500">{formatCurrency(totalPrice)}</p>
            {surchargeTotal > 0 && (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                base {formatCurrency(basePrice)} + acréscimos {formatCurrency(surchargeTotal)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tamanho */}
      <div>
        <label className="label">Tamanho *</label>
        <div className="grid grid-cols-3 gap-3">
          {sizes.map(s => (
            <button key={s.code} type="button"
              onClick={() => setSizeCode(s.code)}
              className="py-3 px-2 rounded-xl border-2 text-center transition-all"
              style={{
                borderColor: sizeCode === s.code ? 'var(--brand)' : 'var(--border)',
                background:  sizeCode === s.code ? 'rgba(229,92,40,0.06)' : 'var(--bg-card)',
              }}
            >
              <p className="font-bold text-lg" style={{ color: sizeCode === s.code ? 'var(--brand)' : 'var(--text-1)' }}>
                {s.code}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{s.slices} fatias</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-2)' }}>
                {formatCurrency(s.base_price)}
              </p>
            </button>
          ))}
        </div>
        <input type="hidden" name="cake_size_code" value={sizeCode} />
      </div>

      {/* Massas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Massa 1 *</label>
          <select name="cake_mass_1" value={mass1} onChange={e => setMass1(e.target.value)} className="input">
            <option value="">Selecione</option>
            {massas.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Massa 2 <span style={{ color: 'var(--muted)' }}>(opcional)</span></label>
          <select name="cake_mass_2" value={mass2} onChange={e => setMass2(e.target.value)} className="input">
            <option value="">Mesma massa</option>
            {massas.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {/* Recheios */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Recheio 1 *</label>
          <select name="cake_filling_1" value={filling1} onChange={e => setFilling1(e.target.value)} className="input">
            <option value="">Selecione</option>
            {recheios.map(r => {
              const extra = getSurcharge(r.name)
              return (
                <option key={r.id} value={r.name}>
                  {r.name}{extra > 0 ? ` (+${formatCurrency(extra)})` : ''}
                </option>
              )
            })}
          </select>
        </div>
        <div>
          <label className="label">Recheio 2 <span style={{ color: 'var(--muted)' }}>(opcional)</span></label>
          <select name="cake_filling_2" value={filling2} onChange={e => setFilling2(e.target.value)} className="input">
            <option value="">Mesmo recheio</option>
            {recheios.map(r => {
              const extra = getSurcharge(r.name)
              return (
                <option key={r.id} value={r.name}>
                  {r.name}{extra > 0 ? ` (+${formatCurrency(extra)})` : ''}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Cobertura */}
      <div>
        <label className="label">Cobertura *</label>
        <div className="grid grid-cols-3 gap-3">
          {coberturas.map(c => {
            const extra = getSurcharge(c.name)
            return (
              <button key={c.id} type="button"
                onClick={() => setTopping(c.name)}
                className="py-2.5 px-3 rounded-xl border-2 text-center transition-all"
                style={{
                  borderColor: topping === c.name ? 'var(--brand)' : 'var(--border)',
                  background:  topping === c.name ? 'rgba(229,92,40,0.06)' : 'var(--bg-card)',
                }}
              >
                <p className="text-sm font-medium" style={{ color: topping === c.name ? 'var(--brand)' : 'var(--text-1)' }}>
                  {c.name}
                </p>
                {extra > 0 && (
                  <p className="text-xs mt-0.5 text-amber-600">+{formatCurrency(extra)}</p>
                )}
              </button>
            )
          })}
        </div>
        <input type="hidden" name="cake_topping" value={topping} />
        <input type="hidden" name="cake_surcharge" value={surchargeTotal} />
      </div>

      {/* Resumo */}
      {sizeCode && mass1 && filling1 && topping && (
        <div className="rounded-xl p-4 text-sm space-y-1"
          style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--text-1)' }}>Resumo do bolo:</p>
          <p style={{ color: 'var(--text-2)' }}>📏 Tamanho: <strong>{selectedSize?.name}</strong> — {selectedSize?.slices} fatias</p>
          <p style={{ color: 'var(--text-2)' }}>🍰 Massa: <strong>{mass1}{mass2 ? ` + ${mass2}` : ''}</strong></p>
          <p style={{ color: 'var(--text-2)' }}>🍫 Recheio: <strong>{filling1}{filling2 ? ` + ${filling2}` : ''}</strong></p>
          <p style={{ color: 'var(--text-2)' }}>✨ Cobertura: <strong>{topping}</strong></p>
          <p className="pt-2 font-bold text-brand-500 text-base">Total: {formatCurrency(totalPrice)}</p>
        </div>
      )}
    </div>
  )
}

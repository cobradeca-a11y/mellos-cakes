'use client'

import { useState } from 'react'

export function MarkupPreview({ defaultValue }: { defaultValue: number }) {
  const [markup, setMarkup] = useState(defaultValue)

  const margem = markup > 0 ? (((markup - 1) / markup) * 100).toFixed(1) : '0'
  const exemplo = (10 * markup).toFixed(2)

  const cor = Number(margem) >= 50
    ? { text: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)' }
    : Number(margem) >= 30
    ? { text: '#d97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)' }
    : { text: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)' }

  return (
    <div className="space-y-2">
      <input
        type="number"
        name="default_markup"
        step="0.1"
        min="1"
        max="10"
        value={markup}
        onChange={e => setMarkup(Number(e.target.value))}
        className="input"
      />

      {/* Preview discreto */}
      {markup > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all"
          style={{ background: cor.bg, border: `1px solid ${cor.border}` }}>
          <span style={{ color: cor.text }} className="font-bold text-sm">
            {margem}% de margem
          </span>
          <span style={{ color: 'var(--text-3)' }}>
            · custo R$10 → venda R${exemplo}
          </span>
        </div>
      )}
    </div>
  )
}

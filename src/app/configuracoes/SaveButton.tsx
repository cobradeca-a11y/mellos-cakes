'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2, Save } from 'lucide-react'

export function SaveButton({ action }: { action: (fd: FormData) => Promise<void> }) {
  const [state, setState] = useState<'idle' | 'loading' | 'saved'>('idle')
  const [pending, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.closest('form')
    if (!form) return
    e.preventDefault()

    setState('loading')
    const fd = new FormData(form)

    startTransition(async () => {
      await action(fd)
      setState('saved')
      setTimeout(() => setState('idle'), 3000)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === 'loading'}
      className="relative overflow-hidden font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-150 select-none"
      style={{
        background: state === 'saved' ? '#16a34a' : '#e55c28',
        color: 'white',
        boxShadow: state === 'loading'
          ? 'none'
          : state === 'saved'
          ? '0 2px 12px rgba(22,163,74,0.35)'
          : '0 2px 12px rgba(229,92,40,0.35)',
        transform: state === 'loading' ? 'scale(0.97)' : 'scale(1)',
      }}
    >
      {/* Ripple layer */}
      <span
        className="absolute inset-0 rounded-xl transition-opacity duration-300"
        style={{
          background: 'rgba(255,255,255,0.15)',
          opacity: state === 'loading' ? 1 : 0,
        }}
      />

      <span className="relative flex items-center gap-2 justify-center">
        {state === 'idle' && (
          <><Save className="w-4 h-4" /> Salvar Configurações</>
        )}
        {state === 'loading' && (
          <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
        )}
        {state === 'saved' && (
          <><Check className="w-4 h-4" /> Configurações salvas!</>
        )}
      </span>
    </button>
  )
}

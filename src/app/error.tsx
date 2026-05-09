'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-6xl font-display font-bold text-red-400">Ops!</p>
        <h1 className="text-xl font-semibold text-neutral-900 mt-4">Algo deu errado</h1>
        <p className="text-neutral-500 mt-2 max-w-sm mx-auto text-sm">{error.message}</p>
=======
    <div className="min-h-screen bg-[var(--hover)] flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-6xl font-display font-bold text-red-400">Ops!</p>
        <h1 className="text-xl font-semibold text-[var(--text-1)] mt-4">Algo deu errado</h1>
        <p className="text-[var(--text-3)] mt-2 max-w-sm mx-auto text-sm">{error.message}</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
        <button onClick={reset} className="btn-primary mt-6">Tentar novamente</button>
      </div>
    </div>
  )
}

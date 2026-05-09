'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-6xl font-display font-bold text-red-400">Ops!</p>
        <h1 className="text-xl font-semibold text-neutral-900 mt-4">Algo deu errado</h1>
        <p className="text-neutral-500 mt-2 max-w-sm mx-auto text-sm">{error.message}</p>
        <button onClick={reset} className="btn-primary mt-6">Tentar novamente</button>
      </div>
    </div>
  )
}

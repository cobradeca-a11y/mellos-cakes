'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError('Não foi possível enviar o e-mail. Tente novamente.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
<<<<<<< HEAD
        <h2 className="text-xl font-display font-semibold text-neutral-900">E-mail enviado!</h2>
        <p className="text-sm text-neutral-500 mt-2">
=======
        <h2 className="text-xl font-display font-semibold text-[var(--text-1)]">E-mail enviado!</h2>
        <p className="text-sm text-[var(--text-3)] mt-2">
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
          Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
        </p>
        <Link href="/auth/login" className="btn-primary mt-6 inline-flex">
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <div className="mb-6">
<<<<<<< HEAD
        <h2 className="text-xl font-display font-semibold text-neutral-900">Recuperar senha</h2>
        <p className="text-sm text-neutral-500 mt-1">Enviaremos um link para seu e-mail</p>
=======
        <h2 className="text-xl font-display font-semibold text-[var(--text-1)]">Recuperar senha</h2>
        <p className="text-sm text-[var(--text-3)] mt-1">Enviaremos um link para seu e-mail</p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">E-mail</label>
          <div className="relative">
<<<<<<< HEAD
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
=======
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="input pl-9"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : 'Enviar link'}
        </button>
      </form>

<<<<<<< HEAD
      <div className="mt-5 pt-5 border-t border-neutral-100">
        <Link href="/auth/login" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 font-medium">
=======
      <div className="mt-5 pt-5 border-t border-[var(--border-light)]">
        <Link href="/auth/login" className="flex items-center gap-2 text-sm text-[var(--text-3)] hover:text-[var(--text-1)] font-medium">
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
          <ArrowLeft className="w-4 h-4" /> Voltar ao login
        </Link>
      </div>
    </div>
  )
}

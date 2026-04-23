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
        <h2 className="text-xl font-display font-semibold text-neutral-900">E-mail enviado!</h2>
        <p className="text-sm text-neutral-500 mt-2">
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
        <h2 className="text-xl font-display font-semibold text-neutral-900">Recuperar senha</h2>
        <p className="text-sm text-neutral-500 mt-1">Enviaremos um link para seu e-mail</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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

      <div className="mt-5 pt-5 border-t border-neutral-100">
        <Link href="/auth/login" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar ao login
        </Link>
      </div>
    </div>
  )
}

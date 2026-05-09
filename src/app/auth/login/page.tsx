'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
<<<<<<< HEAD

=======
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
<<<<<<< HEAD

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos. Tente novamente.')
      setLoading(false)
      return
    }

=======
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha incorretos. Tente novamente.')
      setLoading(false)
      return
    }
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
    router.push('/dashboard')
    router.refresh()
  }

  return (
<<<<<<< HEAD
    <div className="card p-8">
      <div className="mb-6">
        <h2 className="text-xl font-display font-semibold text-neutral-900">Entrar na plataforma</h2>
        <p className="text-sm text-neutral-500 mt-1">Acesse sua conta para continuar</p>
=======
    <div className="card p-8" style={{ boxShadow: '0 8px 40px rgb(0 0 0 / 0.12)' }}>
      <div className="mb-6">
        <h2 className="text-xl font-display font-semibold" style={{ color: 'var(--text-1)' }}>
          Entrar na plataforma
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Acesse sua conta para continuar
        </p>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">E-mail</label>
          <div className="relative">
<<<<<<< HEAD
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
=======
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
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

        <div>
          <label className="label">Senha</label>
          <div className="relative">
<<<<<<< HEAD
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
=======
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
<<<<<<< HEAD
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
=======
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted)' }}
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
<<<<<<< HEAD
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
=======
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
            {error}
          </div>
        )}

<<<<<<< HEAD
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <div className="mt-5 pt-5 border-t border-neutral-100 text-center">
=======
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
            : 'Entrar'
          }
        </button>
      </form>

      <div className="mt-5 pt-5 text-center" style={{ borderTop: '1px solid var(--border)' }}>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
        <Link href="/auth/forgot-password" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
          Esqueceu sua senha?
        </Link>
      </div>
    </div>
  )
}

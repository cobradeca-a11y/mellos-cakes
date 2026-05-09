'use client'

import { useState } from 'react'
import { CalendarioTab } from './tabs/CalendarioTab'
import { MotorIA } from './tabs/MotorIA'
import { Sparkles, History, BrainCircuit } from 'lucide-react'

type Recommendation = {
  produto?: string
  tema?: string
  acao?: string
  canal?: string
  horario?: string
  cta?: string
  observacoes?: string
}

export function SocialTabs({ posts, recommendation }: {
  posts: any[]
  campaigns: any[]
  templates: any[]
  recommendation?: Recommendation
}) {
  const [activeTab, setActiveTab] = useState<'gerar'|'historico'>('gerar')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Redes Sociais</h1>
        <p className="text-sm mt-0.5" style={{ color:'var(--muted)' }}>
          Geração de conteúdo com IA + histórico editorial
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 max-w-xl">
        <button
          onClick={() => setActiveTab('gerar')}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all"
          style={{
            background: activeTab === 'gerar' ? 'var(--brand)' : 'var(--bg-card)',
            color: activeTab === 'gerar' ? 'white' : 'var(--text-2)',
            borderColor: activeTab === 'gerar' ? 'var(--brand)' : 'var(--border)',
          }}
        >
          <Sparkles className="w-4 h-4" /> Gerar
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all"
          style={{
            background: activeTab === 'historico' ? 'var(--brand)' : 'var(--bg-card)',
            color: activeTab === 'historico' ? 'white' : 'var(--text-2)',
            borderColor: activeTab === 'historico' ? 'var(--brand)' : 'var(--border)',
          }}
        >
          <History className="w-4 h-4" /> Histórico
        </button>
      </div>

      {activeTab === 'gerar' && (
        <div className="space-y-4">
          <div className="card p-4 border-l-4 border-brand-500">
            <div className="flex items-start gap-3">
              <BrainCircuit className="w-5 h-5 text-brand-500 mt-0.5" />
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-1)]">Recomendação da Inteligência de Marketing</p>
                  <p className="text-sm text-[var(--text-2)] mt-1">
                    {recommendation?.produto
                      ? `Produto sugerido: ${recommendation.produto}`
                      : 'Nenhum produto disponível foi encontrado. Preencha manualmente o produto para gerar conteúdo.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg p-2 bg-[var(--hover)] border border-[var(--border)]">
                    <span className="text-[var(--text-3)]">Tema: </span>
                    <strong className="text-[var(--text-1)]">{recommendation?.tema ?? '—'}</strong>
                  </div>
                  <div className="rounded-lg p-2 bg-[var(--hover)] border border-[var(--border)]">
                    <span className="text-[var(--text-3)]">Canal: </span>
                    <strong className="text-[var(--text-1)]">{recommendation?.canal ?? '—'}</strong>
                  </div>
                  <div className="rounded-lg p-2 bg-[var(--hover)] border border-[var(--border)]">
                    <span className="text-[var(--text-3)]">Horário: </span>
                    <strong className="text-[var(--text-1)]">{recommendation?.horario ?? '—'}</strong>
                  </div>
                </div>
                {recommendation?.acao && (
                  <p className="text-sm text-[var(--text-2)]">{recommendation.acao}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-5 flex items-center gap-2" style={{ color:'var(--text-1)' }}>
              <span className="text-lg">✨</span> Gerar conteúdo
            </h2>
            <MotorIA
              canal="instagram"
              recommendation={recommendation}
              onSaved={() => setActiveTab('historico')}
            />
          </div>
        </div>
      )}

      {activeTab === 'historico' && <CalendarioTab posts={posts} />}
    </div>
  )
}

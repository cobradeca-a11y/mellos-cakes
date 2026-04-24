'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Save, Check, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

const TIPOS = [
  { id:'fim_de_semana',    label:'🎉 Fim de Semana',       desc:'Venda de final de semana' },
  { id:'data_comemorativa',label:'📅 Data Comemorativa',   desc:'Natal, Páscoa, Dia das Mães...' },
  { id:'produto',          label:'🎂 Produto Específico',  desc:'Divulgar um bolo ou doce' },
  { id:'promocional',      label:'🏷️ Promoção',           desc:'Desconto ou combo especial' },
  { id:'lancamento',       label:'🚀 Lançamento',         desc:'Novo produto ou sabor' },
  { id:'prova_social',     label:'⭐ Prova Social',        desc:'Depoimentos e entregas' },
]

const DIAS_OPTS = [3, 5, 7]
const CANAIS = ['instagram','facebook','tiktok','youtube','whatsapp']

export function CampanhasTab({ campaigns }: { campaigns: any[] }) {
  const supabase = createClient()
  const [tipo, setTipo]     = useState('produto')
  const [dias, setDias]     = useState(3)
  const [produto, setProduto] = useState('')
  const [goal, setGoal]     = useState('')
  const [canais, setCanais] = useState<string[]>(['instagram','whatsapp'])
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any[]>([])
  const [saved, setSaved]   = useState(false)
  const [campanhas, setCampanhas] = useState(campaigns)

  const toggleCanal = (c: string) =>
    setCanais(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c])

  const gerar = async () => {
    if (!produto.trim()) return
    setLoading(true); setResultado([]); setSaved(false)

    const tipoLabel = TIPOS.find(t=>t.id===tipo)?.label ?? tipo

    // Gera conteúdo para cada dia
    const promises = Array.from({length: dias}, async (_, i) => {
      const res = await fetch('/api/social/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motor: i === 0 ? 'venda' : i === dias-1 ? 'prova_social' : i % 2 === 0 ? 'engajamento' : 'venda',
          formato: canais.includes('instagram') ? (i===1?'reels':'post') : 'post',
          canal: canais[0] ?? 'instagram',
          produto,
          objetivo: `Campanha ${tipoLabel} - Dia ${i+1} de ${dias}`,
          tom: 'comercial e amigável',
          cta: 'Encomendar pelo WhatsApp',
          observacoes: `${goal}. Este é o conteúdo do DIA ${i+1} de ${dias} de uma sequência de campanha.`,
        }),
      })
      const data = await res.json()
      return { dia: i+1, ...data.conteudo }
    })

    const resultados = await Promise.all(promises)
    setResultado(resultados)
    setLoading(false)
  }

  const salvar = async () => {
    const { data: camp } = await supabase.from('content_campaigns').insert({
      business_id: BUSINESS_ID,
      name: `Campanha ${TIPOS.find(t=>t.id===tipo)?.label} — ${produto}`,
      type: tipo,
      days: dias,
      motor: 'venda',
      product: produto,
      goal,
      channels: canais,
      active: true,
    }).select().single()

    if (camp) {
      // Salvar posts da campanha
      const postsToInsert = resultado.map((r, i) => ({
        business_id: BUSINESS_ID,
        campaign_id: camp.id,
        title: r.titulo ?? `Dia ${i+1} — ${produto}`,
        caption: r.legenda,
        hashtags: r.hashtags,
        cta: r.cta,
        channel: canais[0] ?? 'instagram',
        status: 'rascunho',
        format: 'post',
        motor: 'venda',
        product: produto,
        script: r.roteiro,
        best_time: r.melhor_horario,
      }))
      await supabase.from('content_posts').insert(postsToInsert)
      setCampanhas(prev => [camp, ...prev])
    }
    setSaved(true)
  }

  return (
    <div className="space-y-5">
      {/* Config */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold" style={{ color:'var(--text-1)' }}>
          🚀 Criar Campanha com Sequência de Conteúdos
        </h2>

        {/* Tipo */}
        <div>
          <p className="label">Tipo de Campanha</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TIPOS.map(t => (
              <button key={t.id} type="button" onClick={() => setTipo(t.id)}
                className="text-left px-3 py-2.5 rounded-xl border-2 transition-all"
                style={{
                  borderColor: tipo===t.id?'var(--brand)':'var(--border)',
                  background:  tipo===t.id?'rgba(229,92,40,0.07)':'var(--bg-card)',
                }}>
                <p className="text-sm font-semibold" style={{ color:tipo===t.id?'var(--brand)':'var(--text-1)' }}>{t.label}</p>
                <p className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Dias */}
        <div>
          <p className="label">Duração da Campanha</p>
          <div className="flex gap-3">
            {DIAS_OPTS.map(d => (
              <button key={d} type="button" onClick={() => setDias(d)}
                className="flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all"
                style={{
                  borderColor: dias===d?'var(--brand)':'var(--border)',
                  background:  dias===d?'var(--brand)':'var(--bg-card)',
                  color:       dias===d?'white':'var(--text-3)',
                }}>
                {d} dias
              </button>
            ))}
          </div>
        </div>

        {/* Canais */}
        <div>
          <p className="label">Canais</p>
          <div className="flex flex-wrap gap-2">
            {CANAIS.map(c => (
              <button key={c} type="button" onClick={() => toggleCanal(c)}
                className="px-4 py-1.5 rounded-xl text-sm font-medium border-2 transition-all capitalize"
                style={{
                  borderColor: canais.includes(c)?'var(--brand)':'var(--border)',
                  background:  canais.includes(c)?'rgba(229,92,40,0.1)':'var(--bg-card)',
                  color:       canais.includes(c)?'var(--brand)':'var(--text-3)',
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Produto / O que divulgar *</label>
            <input value={produto} onChange={e=>setProduto(e.target.value)}
              placeholder="Ex: Bolo de Aniversário Infantil" className="input" />
          </div>
          <div>
            <label className="label">Objetivo da Campanha</label>
            <input value={goal} onChange={e=>setGoal(e.target.value)}
              placeholder="Ex: Lotar a agenda de junho" className="input" />
          </div>
        </div>

        <button onClick={gerar} disabled={loading || !produto.trim()}
          className="btn-primary w-full justify-center py-3 text-base gap-3">
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Gerando {dias} conteúdos com IA...</>
            : <><Sparkles className="w-5 h-5" /> Gerar Sequência de {dias} Dias</>
          }
        </button>
      </div>

      {/* Resultado */}
      {resultado.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" style={{ color:'var(--text-1)' }}>
              Sequência de {dias} dias gerada
            </h3>
            <button onClick={salvar} disabled={saved} className="btn-primary gap-2">
              {saved ? <><Check className="w-4 h-4" /> Campanha salva!</> : <><Save className="w-4 h-4" /> Salvar Campanha</>}
            </button>
          </div>

          {resultado.map((r, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background:'var(--brand)' }}>
                  {i+1}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color:'var(--text-1)' }}>{r.titulo}</p>
                  <p className="text-xs" style={{ color:'var(--muted)' }}>Dia {i+1} de {dias}</p>
                </div>
              </div>
              {r.texto_principal && (
                <p className="text-sm whitespace-pre-wrap mb-2" style={{ color:'var(--text-2)' }}>
                  {r.texto_principal.slice(0, 300)}{r.texto_principal.length > 300 ? '...' : ''}
                </p>
              )}
              {r.hashtags && (
                <p className="text-xs" style={{ color:'#2563eb' }}>{r.hashtags}</p>
              )}
              {r.melhor_horario && (
                <p className="text-xs mt-1" style={{ color:'var(--muted)' }}>🕐 {r.melhor_horario}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Campanhas salvas */}
      {campanhas.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3" style={{ color:'var(--text-1)' }}>Campanhas Salvas</h3>
          <div className="space-y-2">
            {campanhas.map(c => (
              <div key={c.id} className="card p-4">
                <p className="font-medium text-sm" style={{ color:'var(--text-1)' }}>{c.name}</p>
                <p className="text-xs mt-1" style={{ color:'var(--muted)' }}>
                  {c.days} dias • {(c.channels??[]).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

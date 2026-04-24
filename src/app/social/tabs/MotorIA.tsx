'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Copy, Check, Save, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

const MOTORES = [
  { id: 'venda',           label: '🛒 Venda',         desc: 'Conteúdo direto para vender' },
  { id: 'engajamento',     label: '💬 Engajamento',   desc: 'Interação e comentários' },
  { id: 'prova_social',    label: '⭐ Prova Social',  desc: 'Depoimentos e bastidores' },
  { id: 'educativo',       label: '📚 Educativo',     desc: 'Explica diferenciais' },
  { id: 'promocional',     label: '🏷️ Promocional',   desc: 'Ofertas e descontos' },
  { id: 'reaproveitamento',label: '♻️ Reaproveitar',  desc: 'Adapta para outra rede' },
]

const FORMATOS: Record<string, string[]> = {
  instagram: ['post','reels','story','carrossel'],
  facebook:  ['post','reels','story','carrossel'],
  tiktok:    ['reels','story'],
  youtube:   ['shorts'],
  whatsapp:  ['mensagem'],
}

const TONS = ['comercial e amigável','descontraído e divertido','elegante e sofisticado','urgente e escasso','emocional e afetivo']

interface Props {
  canal: string
  onSaved?: () => void
  conteudoOriginal?: string
}

export function MotorIA({ canal, onSaved, conteudoOriginal }: Props) {
  const supabase = createClient()
  const formatos = FORMATOS[canal] ?? ['post']

  const [motor,    setMotor]    = useState('venda')
  const [formato,  setFormato]  = useState(formatos[0])
  const [produto,  setProduto]  = useState('')
  const [publico,  setPublico]  = useState('pessoas que amam bolos artesanais')
  const [tom,      setTom]      = useState(TONS[0])
  const [cta,      setCta]      = useState('Encomendar pelo WhatsApp')
  const [link,     setLink]     = useState('')
  const [obs,      setObs]      = useState('')

  const [loading,  setLoading]  = useState(false)
  const [resultado,setResultado]= useState<any>(null)
  const [erro,     setErro]     = useState('')
  const [copied,   setCopied]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  const gerar = async () => {
    if (!produto.trim()) { setErro('Informe o produto.'); return }
    setLoading(true); setErro(''); setResultado(null); setSaved(false)

    const res = await fetch('/api/social/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        motor, formato, canal, produto, publico, tom,
        cta, link_whatsapp: link, observacoes: obs,
        conteudo_original: conteudoOriginal,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!data.ok) { setErro(data.erro ?? 'Erro ao gerar.'); return }
    setResultado(data.conteudo)
  }

  const copiar = () => {
    const texto = resultado?.texto_principal + '\n\n' + resultado?.legenda + '\n\n' + resultado?.hashtags
    navigator.clipboard.writeText(texto)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const salvar = async () => {
    if (!resultado) return
    await supabase.from('content_posts').insert({
      business_id: BUSINESS_ID,
      title:       resultado.titulo ?? produto,
      caption:     resultado.legenda,
      hashtags:    resultado.hashtags,
      cta:         resultado.cta,
      channel:     canal,
      status:      'rascunho',
      format:      formato,
      motor,
      product:     produto,
      target_audience: publico,
      tone:        tom,
      cta_link:    link,
      notes:       obs,
      script:      resultado.roteiro,
      carousel_slides: resultado.slides,
      stories_sequence: resultado.stories,
      best_time:   resultado.melhor_horario,
    })
    setSaved(true)
    onSaved?.()
  }

  return (
    <div className="space-y-5">

      {/* Seleção de motor */}
      <div>
        <p className="label">Motor de IA</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MOTORES.map(m => (
            <button key={m.id} type="button" onClick={() => setMotor(m.id)}
              className="text-left px-3 py-2.5 rounded-xl border-2 transition-all"
              style={{
                borderColor: motor === m.id ? 'var(--brand)' : 'var(--border)',
                background:  motor === m.id ? 'rgba(229,92,40,0.07)' : 'var(--bg-card)',
              }}>
              <p className="text-sm font-semibold" style={{ color: motor===m.id?'var(--brand)':'var(--text-1)' }}>{m.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Formato */}
      <div>
        <p className="label">Formato</p>
        <div className="flex flex-wrap gap-2">
          {formatos.map(f => (
            <button key={f} type="button" onClick={() => setFormato(f)}
              className="px-4 py-1.5 rounded-xl text-sm font-medium border-2 transition-all capitalize"
              style={{
                borderColor: formato === f ? 'var(--brand)' : 'var(--border)',
                background:  formato === f ? 'var(--brand)' : 'var(--bg-card)',
                color:       formato === f ? 'white' : 'var(--text-3)',
              }}>
              {f === 'reels' ? 'Reels/Vídeo' : f === 'shorts' ? 'Shorts' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Produto / O que vai divulgar *</label>
          <input value={produto} onChange={e=>setProduto(e.target.value)}
            placeholder="Ex: Bolo de Chocolate M com Ninho e Nutella"
            className="input" />
        </div>
        <div>
          <label className="label">Público-alvo</label>
          <input value={publico} onChange={e=>setPublico(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Tom de voz</label>
          <select value={tom} onChange={e=>setTom(e.target.value)} className="input">
            {TONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Chamada para ação (CTA)</label>
          <input value={cta} onChange={e=>setCta(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">WhatsApp / Link de contato</label>
          <input value={link} onChange={e=>setLink(e.target.value)}
            placeholder="Ex: wa.me/5553999999999" className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Observações adicionais</label>
          <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2}
            placeholder="Promoção especial, prazo, tema, etc."
            className="input resize-none" />
        </div>
      </div>

      {erro && (
        <div className="px-4 py-3 rounded-xl text-sm"
          style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.2)', color:'#dc2626' }}>
          {erro}
        </div>
      )}

      <button onClick={gerar} disabled={loading}
        className="btn-primary w-full justify-center py-3 text-base gap-3">
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Gerando com IA...</>
          : <><Sparkles className="w-5 h-5" /> Gerar Conteúdo</>
        }
      </button>

      {/* Resultado */}
      {resultado && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" style={{ color:'var(--text-1)' }}>
              ✅ Conteúdo gerado — salvo como rascunho após revisão
            </h3>
            <div className="flex gap-2">
              <button onClick={gerar} className="btn-ghost text-xs gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Regerar
              </button>
              <button onClick={copiar} className="btn-secondary text-xs gap-1.5">
                {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
              </button>
              <button onClick={salvar} disabled={saved} className="btn-primary text-xs gap-1.5">
                {saved ? <><Check className="w-3.5 h-3.5" /> Salvo!</> : <><Save className="w-3.5 h-3.5" /> Salvar Rascunho</>}
              </button>
            </div>
          </div>

          {/* Cards de resultado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {resultado.texto_principal && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>TEXTO PRINCIPAL</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color:'var(--text-1)' }}>{resultado.texto_principal}</p>
              </div>
            )}

            {resultado.legenda && (
              <div className="card p-4">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>LEGENDA</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color:'var(--text-2)' }}>{resultado.legenda}</p>
              </div>
            )}

            {resultado.hashtags && (
              <div className="card p-4">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>HASHTAGS</p>
                <p className="text-sm" style={{ color:'#2563eb' }}>{resultado.hashtags}</p>
              </div>
            )}

            {resultado.cta && (
              <div className="card p-4">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>CHAMADA PARA AÇÃO</p>
                <p className="text-sm font-medium" style={{ color:'var(--brand)' }}>{resultado.cta}</p>
              </div>
            )}

            <div className="card p-4">
              <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>SUGESTÕES DA IA</p>
              <p className="text-xs" style={{ color:'var(--text-3)' }}>📱 Rede: <strong>{resultado.melhor_rede}</strong></p>
              <p className="text-xs mt-1" style={{ color:'var(--text-3)' }}>🕐 Horário: <strong>{resultado.melhor_horario}</strong></p>
              {resultado.dica && <p className="text-xs mt-1 italic" style={{ color:'var(--muted)' }}>💡 {resultado.dica}</p>}
            </div>

            {/* Roteiro */}
            {resultado.roteiro && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>ROTEIRO DO VÍDEO</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color:'var(--text-2)' }}>{resultado.roteiro}</p>
              </div>
            )}

            {/* Slides */}
            {resultado.slides && Array.isArray(resultado.slides) && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-3" style={{ color:'var(--muted)' }}>SLIDES DO CARROSSEL</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {resultado.slides.map((s: any, i: number) => (
                    <div key={i} className="rounded-xl p-3 text-center"
                      style={{ background:'var(--hover)', border:'1px solid var(--border)' }}>
                      <p className="text-xs font-bold mb-1" style={{ color:'var(--brand)' }}>Slide {i+1}</p>
                      <p className="text-sm font-semibold" style={{ color:'var(--text-1)' }}>{s.titulo}</p>
                      <p className="text-xs mt-1" style={{ color:'var(--text-3)' }}>{s.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stories */}
            {resultado.stories && Array.isArray(resultado.stories) && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-3" style={{ color:'var(--muted)' }}>SEQUÊNCIA DE STORIES</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {resultado.stories.map((s: any, i: number) => (
                    <div key={i} className="shrink-0 w-36 rounded-xl p-3 text-center"
                      style={{ background:'var(--hover)', border:'1px solid var(--border)', minHeight:'120px' }}>
                      <p className="text-xs font-bold mb-2" style={{ color:'var(--brand)' }}>Tela {s.tela ?? i+1}</p>
                      <p className="text-xs" style={{ color:'var(--text-2)' }}>{s.texto}</p>
                      {s.acao && <p className="text-xs mt-2 italic" style={{ color:'var(--muted)' }}>👆 {s.acao}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Copy, Check, Save, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

type Recommendation = {
  produto?: string
  tema?: string
  acao?: string
  canal?: string
  horario?: string
  cta?: string
  observacoes?: string
}

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
  recommendation?: Recommendation
}

function safeText(value: any): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(safeText).filter(Boolean).join('\n')
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, val]) => `${key.replaceAll('_', ' ')}: ${safeText(val)}`)
      .filter(line => !line.endsWith(': '))
      .join('\n')
  }
  return String(value)
}

function formatContentForCopy(resultado: any) {
  const blocks = [
    safeText(resultado?.texto_principal),
    safeText(resultado?.legenda),
    safeText(resultado?.hashtags),
    safeText(resultado?.cta),
    resultado?.melhor_horario ? `Melhor horário: ${safeText(resultado.melhor_horario)}` : '',
    resultado?.orientacao_propaganda ? `Orientação de propaganda: ${safeText(resultado.orientacao_propaganda)}` : '',
    resultado?.prompt_imagem ? `Prompt visual: ${safeText(resultado.prompt_imagem)}` : '',
    resultado?.texto_na_arte ? `Texto na arte: ${safeText(resultado.texto_na_arte)}` : '',
    resultado?.fundo_visual ? `Fundo visual: ${safeText(resultado.fundo_visual)}` : '',
  ].filter(Boolean)

  return blocks.join('\n\n')
}

export function MotorIA({ canal, onSaved, conteudoOriginal, recommendation }: Props) {
  const supabase = createClient()
  const formatos = FORMATOS[canal] ?? ['post']

  const [motor,    setMotor]    = useState('venda')
  const [formato,  setFormato]  = useState(formatos[0])
  const [produto,  setProduto]  = useState(recommendation?.produto ?? '')
  const [publico,  setPublico]  = useState('pessoas que amam bolos artesanais')
  const [tom,      setTom]      = useState(TONS[0])
  const [cta,      setCta]      = useState(recommendation?.cta ?? 'Encomendar pelo WhatsApp')
  const [link,     setLink]     = useState('')
  const [obs,      setObs]      = useState(recommendation?.observacoes ?? '')

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

    if (!data.ok) { setErro(data.erro ?? 'Erro ao gerar. Verifique a configuração da API.'); return }
    setResultado(data.conteudo)
    if (data.aviso) setErro(data.aviso)
  }

  const copiar = () => {
    navigator.clipboard.writeText(formatContentForCopy(resultado))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const salvar = async () => {
    if (!resultado) return
    await supabase.from('content_posts').insert({
      business_id: BUSINESS_ID,
      title:       safeText(resultado.titulo) || produto,
      caption:     safeText(resultado.legenda),
      hashtags:    safeText(resultado.hashtags),
      cta:         safeText(resultado.cta),
      channel:     canal,
      status:      'rascunho',
      format:      formato,
      motor,
      product:     produto,
      target_audience: publico,
      tone:        tom,
      cta_link:    link,
      notes: [
        obs,
        resultado.orientacao_propaganda ? `Orientação de propaganda: ${safeText(resultado.orientacao_propaganda)}` : '',
        resultado.prompt_imagem ? `Prompt visual: ${safeText(resultado.prompt_imagem)}` : '',
        resultado.texto_na_arte ? `Texto na arte: ${safeText(resultado.texto_na_arte)}` : '',
        resultado.fundo_visual ? `Fundo visual: ${safeText(resultado.fundo_visual)}` : '',
        resultado.interacoes ? `Interações: ${JSON.stringify(resultado.interacoes)}` : '',
        resultado.checklist_publicacao ? `Checklist: ${JSON.stringify(resultado.checklist_publicacao)}` : '',
      ].filter(Boolean).join('\n\n'),
      script:      safeText(resultado.roteiro),
      carousel_slides: resultado.slides,
      stories_sequence: resultado.stories,
      best_time:   safeText(resultado.melhor_horario),
    })
    setSaved(true)
    onSaved?.()
  }

  return (
    <div className="space-y-5">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Produto / O que vai divulgar *</label>
          <input value={produto} onChange={e=>setProduto(e.target.value)}
            placeholder="Ex: Bolo de Pote Ninho com Nutella"
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
          <p className="text-xs mt-1 text-[var(--text-3)]">CTA é o próximo passo do cliente. Ex: pedir pelo WhatsApp.</p>
        </div>
        <div>
          <label className="label">WhatsApp / Link de contato</label>
          <input value={link} onChange={e=>setLink(e.target.value)}
            placeholder="Ex: wa.me/5553999999999" className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Orientação da Inteligência de Marketing / Observações</label>
          <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={4}
            placeholder="Promoção especial, prazo, lançamento de sabor novo, tema, preço, retirada/entrega, etc."
            className="input resize-none" />
        </div>
      </div>

      {erro && (
        <div className="px-4 py-3 rounded-xl text-sm"
          style={{
            background: erro.startsWith('⚠️') || erro.startsWith('Conteúdo de demonstração') 
              ? 'rgba(234,179,8,0.1)' : 'rgba(220,38,38,0.08)',
            border: erro.startsWith('⚠️') || erro.startsWith('Conteúdo de demonstração')
              ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(220,38,38,0.2)',
            color: erro.startsWith('⚠️') || erro.startsWith('Conteúdo de demonstração')
              ? '#92400e' : '#dc2626'
          }}>
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

      {resultado && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between gap-3 flex-wrap">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resultado.texto_principal && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>TEXTO PRINCIPAL</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color:'var(--text-1)' }}>{safeText(resultado.texto_principal)}</p>
              </div>
            )}

            {resultado.legenda && (
              <div className="card p-4">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>LEGENDA</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color:'var(--text-2)' }}>{safeText(resultado.legenda)}</p>
              </div>
            )}

            {resultado.hashtags && (
              <div className="card p-4">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>HASHTAGS</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color:'#2563eb' }}>{safeText(resultado.hashtags)}</p>
              </div>
            )}

            {resultado.cta && (
              <div className="card p-4">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>CHAMADA PARA AÇÃO</p>
                <p className="text-sm font-medium" style={{ color:'var(--brand)' }}>{safeText(resultado.cta)}</p>
              </div>
            )}

            <div className="card p-4">
              <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>SUGESTÕES DA IA</p>
              <p className="text-xs" style={{ color:'var(--text-3)' }}>📱 Rede: <strong>{safeText(resultado.melhor_rede)}</strong></p>
              <p className="text-xs mt-1" style={{ color:'var(--text-3)' }}>🕐 Horário: <strong>{safeText(resultado.melhor_horario)}</strong></p>
              {resultado.dica && <p className="text-xs mt-1 italic" style={{ color:'var(--muted)' }}>💡 {safeText(resultado.dica)}</p>}
            </div>

            {resultado.orientacao_propaganda && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>ORIENTAÇÃO DE PROPAGANDA</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color:'var(--text-2)' }}>{safeText(resultado.orientacao_propaganda)}</p>
              </div>
            )}

            {(resultado.prompt_imagem || resultado.texto_na_arte || resultado.fundo_visual) && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-3" style={{ color:'var(--muted)' }}>DIREÇÃO VISUAL PROFISSIONAL</p>
                {resultado.prompt_imagem && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold mb-1" style={{ color:'var(--text-3)' }}>Prompt para imagem/fundo</p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color:'var(--text-2)' }}>{safeText(resultado.prompt_imagem)}</p>
                  </div>
                )}
                {resultado.texto_na_arte && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold mb-1" style={{ color:'var(--text-3)' }}>Texto para colocar na arte</p>
                    <p className="text-sm font-semibold" style={{ color:'var(--brand)' }}>{safeText(resultado.texto_na_arte)}</p>
                  </div>
                )}
                {resultado.fundo_visual && (
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color:'var(--text-3)' }}>Fundo / composição</p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color:'var(--text-2)' }}>{safeText(resultado.fundo_visual)}</p>
                  </div>
                )}
              </div>
            )}

            {resultado.interacoes && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-3" style={{ color:'var(--muted)' }}>INTERAÇÕES PARA STORIES / ENGAJAMENTO</p>
                {resultado.interacoes.enquete && <p className="text-sm" style={{ color:'var(--text-2)' }}>📊 Enquete: <strong>{safeText(resultado.interacoes.enquete)}</strong></p>}
                {Array.isArray(resultado.interacoes.opcoes) && resultado.interacoes.opcoes.length > 0 && (
                  <p className="text-sm mt-1" style={{ color:'var(--text-2)' }}>Opções: {resultado.interacoes.opcoes.map(safeText).join(' / ')}</p>
                )}
                {resultado.interacoes.caixa_pergunta && <p className="text-sm mt-1" style={{ color:'var(--text-2)' }}>💬 Caixa de pergunta: {safeText(resultado.interacoes.caixa_pergunta)}</p>}
                {resultado.interacoes.contagem_regressiva && <p className="text-sm mt-1" style={{ color:'var(--brand)' }}>⏳ Contagem regressiva: {safeText(resultado.interacoes.contagem_regressiva)}</p>}
              </div>
            )}

            {Array.isArray(resultado.checklist_publicacao) && resultado.checklist_publicacao.length > 0 && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-3" style={{ color:'var(--muted)' }}>CHECKLIST DE PUBLICAÇÃO</p>
                <ul className="space-y-1">
                  {resultado.checklist_publicacao.map((item: any, i: number) => (
                    <li key={i} className="text-sm" style={{ color:'var(--text-2)' }}>✓ {safeText(item)}</li>
                  ))}
                </ul>
              </div>
            )}

            {resultado.roteiro && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>ROTEIRO DO VÍDEO</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color:'var(--text-2)' }}>{safeText(resultado.roteiro)}</p>
              </div>
            )}

            {resultado.slides && Array.isArray(resultado.slides) && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-3" style={{ color:'var(--muted)' }}>SLIDES DO CARROSSEL</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {resultado.slides.map((s: any, i: number) => (
                    <div key={i} className="rounded-xl p-3 text-center"
                      style={{ background:'var(--hover)', border:'1px solid var(--border)' }}>
                      <p className="text-xs font-bold mb-1" style={{ color:'var(--brand)' }}>Slide {i+1}</p>
                      <p className="text-sm font-semibold" style={{ color:'var(--text-1)' }}>{safeText(s.titulo)}</p>
                      <p className="text-xs mt-1" style={{ color:'var(--text-3)' }}>{safeText(s.texto)}</p>
                      {s.intencao && <p className="text-[11px] mt-2 italic" style={{ color:'var(--muted)' }}>Objetivo: {safeText(s.intencao)}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resultado.stories && Array.isArray(resultado.stories) && (
              <div className="card p-4 md:col-span-2">
                <p className="text-xs font-semibold mb-3" style={{ color:'var(--muted)' }}>SEQUÊNCIA DE STORIES</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {resultado.stories.map((s: any, i: number) => (
                    <div key={i} className="shrink-0 w-44 rounded-xl p-3 text-center"
                      style={{ background:'var(--hover)', border:'1px solid var(--border)', minHeight:'130px' }}>
                      <p className="text-xs font-bold mb-2" style={{ color:'var(--brand)' }}>Tela {safeText(s.tela) || i+1}</p>
                      <p className="text-xs" style={{ color:'var(--text-2)' }}>{safeText(s.texto)}</p>
                      {s.acao && <p className="text-xs mt-2 italic" style={{ color:'var(--muted)' }}>👆 {safeText(s.acao)}</p>}
                      {s.sticker && <p className="text-xs mt-2" style={{ color:'var(--brand)' }}>Sticker: {safeText(s.sticker)}</p>}
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

'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Save, Copy, Check, Plus, Trash2, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

const TIPOS_MENSAGEM = [
  { id:'atendimento',  label:'👋 Atendimento',          desc:'Primeira mensagem ao cliente' },
  { id:'resposta_rapida',label:'⚡ Resposta Rápida',    desc:'Dúvidas frequentes' },
  { id:'orcamento',    label:'💰 Orçamento',             desc:'Envio de proposta de preço' },
  { id:'fechamento',   label:'✅ Fechamento de Venda',   desc:'Confirmar o pedido' },
  { id:'recuperacao',  label:'💌 Recuperar Cliente',     desc:'Cliente sumiu? Reative' },
]

const STATUS_CONTATO = [
  { id:'novo',               label:'🔵 Novo',               color:'#2563eb' },
  { id:'em_atendimento',     label:'🟡 Em Atendimento',     color:'#f59e0b' },
  { id:'aguardando_resposta',label:'🟠 Aguardando Resposta', color:'#f97316' },
  { id:'fechado',            label:'🟢 Fechado',             color:'#16a34a' },
  { id:'perdido',            label:'🔴 Perdido',             color:'#dc2626' },
]

export function WhatsAppTab({ templates }: { templates: any[] }) {
  const supabase = createClient()
  const [view, setView]     = useState<'gerar'|'modelos'>('gerar')
  const [tipo, setTipo]     = useState('atendimento')
  const [produto, setProduto] = useState('')
  const [obs, setObs]       = useState('')
  const [link, setLink]     = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [nomeModelo, setNomeModelo] = useState('')
  const [modelos, setModelos] = useState(templates)

  const gerar = async () => {
    setLoading(true); setResultado(null); setSaved(false)

    const tipoLabel = TIPOS_MENSAGEM.find(t => t.id === tipo)?.label ?? tipo

    const res = await fetch('/api/social/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        motor: 'venda', formato: 'mensagem', canal: 'whatsapp',
        produto: produto || 'bolos e doces artesanais',
        objetivo: tipoLabel,
        tom: 'amigável e comercial',
        cta: 'Encomendar pelo WhatsApp',
        link_whatsapp: link,
        observacoes: `Tipo de mensagem: ${tipoLabel}. ${obs}`,
      }),
    })

    const data = await res.json()
    setLoading(false)
    if (data.ok) setResultado(data.conteudo)
  }

  const copiar = () => {
    navigator.clipboard.writeText(resultado?.texto_principal ?? '')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const salvarModelo = async () => {
    if (!resultado || !nomeModelo.trim()) return
    const { data } = await supabase.from('whatsapp_templates').insert({
      business_id: BUSINESS_ID,
      name: nomeModelo,
      type: tipo,
      content: resultado.texto_principal,
    }).select().single()
    if (data) { setModelos(prev => [data, ...prev]); setSaved(true); setNomeModelo('') }
  }

  const excluirModelo = async (id: string) => {
    if (!confirm('Excluir modelo?')) return
    await supabase.from('whatsapp_templates').delete().eq('id', id)
    setModelos(prev => prev.filter(m => m.id !== id))
  }

  const tipoLabel: Record<string,string> = {
    atendimento:'Atendimento', resposta_rapida:'Resposta Rápida', orcamento:'Orçamento',
    fechamento:'Fechamento', recuperacao:'Recuperação', outro:'Outro'
  }

  return (
    <div className="space-y-5">
      {/* Sub-abas */}
      <div className="flex gap-2">
        {[
          { id:'gerar',   label:'✨ Gerar Mensagem' },
          { id:'modelos', label:`📋 Modelos Salvos (${modelos.length})` },
        ].map(v => (
          <button key={v.id} onClick={() => setView(v.id as any)}
            className="px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all"
            style={{
              borderColor: view===v.id?'#25d366':'var(--border)',
              background:  view===v.id?'#25d366':'var(--bg-card)',
              color:       view===v.id?'white':'var(--text-3)',
            }}>
            {v.label}
          </button>
        ))}
      </div>

      {view === 'gerar' && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold flex items-center gap-2" style={{ color:'var(--text-1)' }}>
            <MessageCircle className="w-5 h-5 text-[#25d366]" /> Gerar mensagem para WhatsApp
          </h2>

          {/* Tipo */}
          <div>
            <p className="label">Tipo de Mensagem</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TIPOS_MENSAGEM.map(t => (
                <button key={t.id} type="button" onClick={() => setTipo(t.id)}
                  className="text-left px-3 py-2.5 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: tipo===t.id?'#25d366':'var(--border)',
                    background:  tipo===t.id?'rgba(37,211,102,0.07)':'var(--bg-card)',
                  }}>
                  <p className="text-sm font-semibold" style={{ color:tipo===t.id?'#25d366':'var(--text-1)' }}>{t.label}</p>
                  <p className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Produto / Serviço</label>
              <input value={produto} onChange={e=>setProduto(e.target.value)}
                placeholder="Ex: Bolo de aniversário" className="input" />
            </div>
            <div>
              <label className="label">Seu WhatsApp / Link</label>
              <input value={link} onChange={e=>setLink(e.target.value)}
                placeholder="wa.me/5553999999999" className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Observações</label>
              <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2}
                placeholder="Informações extras, promoção, situação específica..."
                className="input resize-none" />
            </div>
          </div>

          <button onClick={gerar} disabled={loading}
            className="w-full justify-center py-3 text-base gap-3 rounded-xl font-semibold text-white flex items-center"
            style={{ background:'#25d366' }}>
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Gerando...</>
              : <><Sparkles className="w-5 h-5" /> Gerar Mensagem</>
            }
          </button>

          {resultado && (
            <div className="space-y-3 animate-fade-in">
              <div className="card p-4">
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--muted)' }}>MENSAGEM GERADA</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color:'var(--text-1)' }}>
                  {resultado.texto_principal}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button onClick={copiar} className="btn-secondary flex items-center gap-2 text-sm">
                  {copied ? <><Check className="w-4 h-4 text-green-500" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar</>}
                </button>
              </div>

              {/* Salvar como modelo */}
              <div className="flex gap-2">
                <input value={nomeModelo} onChange={e=>setNomeModelo(e.target.value)}
                  placeholder="Nome do modelo para salvar..."
                  className="input flex-1" />
                <button onClick={salvarModelo} disabled={!nomeModelo.trim() || saved}
                  className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
                  {saved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar Modelo</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'modelos' && (
        <div className="space-y-3">
          {modelos.length === 0 ? (
            <div className="card p-10 text-center" style={{ color:'var(--muted)' }}>
              <p className="text-4xl mb-3">💬</p>
              <p>Nenhum modelo salvo ainda. Gere uma mensagem e salve como modelo.</p>
            </div>
          ) : modelos.map(m => (
            <div key={m.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm" style={{ color:'var(--text-1)' }}>{m.name}</p>
                  <span className="badge-gray text-xs">{tipoLabel[m.type] ?? m.type}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { navigator.clipboard.writeText(m.content) }}
                    className="btn-ghost p-1.5" title="Copiar">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => excluirModelo(m.id)}
                    className="btn-ghost p-1.5 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs mt-2 whitespace-pre-wrap" style={{ color:'var(--text-3)' }}>
                {m.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

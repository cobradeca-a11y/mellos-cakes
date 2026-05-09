'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Check, BarChart2 } from 'lucide-react'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'
const CANAIS = ['instagram','facebook','tiktok','youtube','whatsapp']
const FORMATOS = ['post','reels','story','shorts','carrossel','mensagem']

export function RelatoriosSocialTab({ posts }: { posts: any[] }) {
  const supabase = createClient()
  const [view, setView] = useState<'registrar'|'ver'>('ver')

  // Stats gerais
  const publicados = posts.filter(p => p.status === 'publicado')
  const totalAlcance    = publicados.reduce((s,p) => s + (p.reach ?? 0), 0)
  const totalLikes      = publicados.reduce((s,p) => s + (p.likes ?? 0), 0)
  const totalComentarios= publicados.reduce((s,p) => s + (p.comments ?? 0), 0)
  const totalVendas     = publicados.reduce((s,p) => s + (p.sales_generated ?? 0), 0)

  // Form state
  const [form, setForm] = useState({
    post_id:'', canal:'instagram', formato:'post', produto:'',
    posted_at: new Date().toISOString().slice(0,10),
    reach:0, likes:0, comments:0, shares:0, saves:0,
    whatsapp_clicks:0, sales_generated:0, observations:'',
  })
  const [saved, setSaved] = useState(false)

  const salvar = async () => {
    if (!form.post_id && !form.produto) return
    const updateData: any = {
      channel: form.canal,
      format:  form.formato,
      product: form.produto,
      posted_at: form.posted_at,
      reach:          form.reach,
      likes:          form.likes,
      comments:       form.comments,
      shares:         form.shares,
      saves:          form.saves,
      whatsapp_clicks:form.whatsapp_clicks,
      sales_generated:form.sales_generated,
      observations:   form.observations,
      status: 'publicado',
    }
    if (form.post_id) {
      await supabase.from('content_posts').update(updateData).eq('id', form.post_id)
    } else {
      await supabase.from('content_posts').insert({
        ...updateData,
        business_id: BUSINESS_ID,
        title: form.produto,
        status: 'publicado',
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[
          { id:'ver',       label:'📊 Visão Geral' },
          { id:'registrar', label:'✏️ Registrar Dados' },
        ].map(v => (
          <button key={v.id} onClick={() => setView(v.id as any)}
            className="px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all"
            style={{
              borderColor: view===v.id?'#0891b2':'var(--border)',
              background:  view===v.id?'#0891b2':'var(--bg-card)',
              color:       view===v.id?'white':'var(--text-3)',
            }}>
            {v.label}
          </button>
        ))}
      </div>

      {view === 'ver' && (
        <div className="space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label:'Publicados',   value: publicados.length,    color:'#2563eb' },
              { label:'Alcance Total',value: totalAlcance,         color:'#7c3aed' },
              { label:'Curtidas',     value: totalLikes,           color:'#e1306c' },
              { label:'Vendas',       value: totalVendas,          color:'#16a34a' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <p className="text-xs mb-1" style={{ color:'var(--muted)' }}>{s.label}</p>
                <p className="text-2xl font-display font-bold" style={{ color:s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabela */}
          <div className="table-container">
            <div className="px-5 py-4 border-b" style={{ borderColor:'var(--border)' }}>
              <h3 className="font-semibold" style={{ color:'var(--text-1)' }}>Publicações com métricas</h3>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th><th>Canal</th><th>Produto</th><th>Formato</th>
                  <th>Alcance</th><th>Curtidas</th><th>Coments</th><th>Vendas</th>
                </tr>
              </thead>
              <tbody>
                {publicados.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8" style={{ color:'var(--muted)' }}>
                    Nenhum dado registrado ainda
                  </td></tr>
                ) : publicados.sort((a,b) => new Date(b.posted_at??b.created_at).getTime() - new Date(a.posted_at??a.created_at).getTime()).map(p => (
                  <tr key={p.id}>
                    <td className="text-xs">{p.posted_at?.slice(0,10) ?? '—'}</td>
                    <td className="capitalize text-xs">{p.channel}</td>
                    <td className="text-xs max-w-32 truncate">{p.product ?? p.title ?? '—'}</td>
                    <td><span className="badge-gray capitalize text-xs">{p.format ?? '—'}</span></td>
                    <td className="font-mono text-xs">{p.reach ?? 0}</td>
                    <td className="font-mono text-xs">{p.likes ?? 0}</td>
                    <td className="font-mono text-xs">{p.comments ?? 0}</td>
                    <td className="font-mono text-xs font-bold" style={{ color:'#16a34a' }}>{p.sales_generated ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'registrar' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold" style={{ color:'var(--text-1)' }}>Registrar métricas de publicação</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Conteúdo salvo (opcional)</label>
              <select value={form.post_id} onChange={e=>set('post_id',e.target.value)} className="input">
                <option value="">Novo registro manual</option>
                {posts.filter(p=>p.status==='publicado').map(p => (
                  <option key={p.id} value={p.id}>{p.title ?? p.product ?? p.id.slice(0,8)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Produto divulgado</label>
              <input value={form.produto} onChange={e=>set('produto',e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Rede Social</label>
              <select value={form.canal} onChange={e=>set('canal',e.target.value)} className="input">
                {CANAIS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Formato</label>
              <select value={form.formato} onChange={e=>set('formato',e.target.value)} className="input">
                {FORMATOS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Data da Postagem</label>
              <input type="date" value={form.posted_at} onChange={e=>set('posted_at',e.target.value)} className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key:'reach',          label:'Alcance' },
              { key:'likes',          label:'Curtidas' },
              { key:'comments',       label:'Comentários' },
              { key:'shares',         label:'Compartilhamentos' },
              { key:'saves',          label:'Salvamentos' },
              { key:'whatsapp_clicks',label:'Cliques WhatsApp' },
              { key:'sales_generated',label:'Vendas Geradas' },
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input type="number" min="0" value={(form as any)[f.key]}
                  onChange={e=>set(f.key, Number(e.target.value))} className="input" />
              </div>
            ))}
          </div>

          <div>
            <label className="label">Observações</label>
            <textarea value={form.observations} onChange={e=>set('observations',e.target.value)}
              rows={2} className="input resize-none" />
          </div>

          <button onClick={salvar} className="btn-primary gap-2">
            {saved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar Métricas</>}
          </button>
        </div>
      )}
    </div>
  )
}

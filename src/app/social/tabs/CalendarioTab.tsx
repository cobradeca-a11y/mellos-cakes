'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Copy, CheckCircle, Calendar } from 'lucide-react'

const CHANNELS = ['todos','instagram','facebook','tiktok','youtube','whatsapp']
const STATUS   = ['todos','ideia','rascunho','aprovado','agendado','publicado']
const STATUS_BADGE: Record<string,string> = {
  rascunho:'badge-yellow', aprovado:'badge-blue', agendado:'badge bg-purple-100 text-purple-700',
  publicado:'badge-green', ideia:'badge-gray',
}
const CANAL_EMOJI: Record<string,string> = {
  instagram:'📸', facebook:'👤', tiktok:'🎵', youtube:'▶️', whatsapp:'💬'
}

export function CalendarioTab({ posts }: { posts: any[] }) {
  const supabase = createClient()
  const [items, setItems]   = useState(posts)
  const [canal, setCanal]   = useState('todos')
  const [status, setStatus] = useState('todos')
  const [editId, setEditId] = useState<string|null>(null)
  const [editDate, setEditDate] = useState('')

  const filtered = items.filter(p => {
    if (canal  !== 'todos' && p.channel !== canal)  return false
    if (status !== 'todos' && p.status  !== status) return false
    return true
  }).sort((a,b) => {
    const da = a.scheduled_at ?? a.created_at
    const db = b.scheduled_at ?? b.created_at
    return new Date(da).getTime() - new Date(db).getTime()
  })

  const excluir = async (id: string) => {
    if (!confirm('Excluir?')) return
    await supabase.from('content_posts').delete().eq('id', id)
    setItems(prev => prev.filter(p => p.id!==id))
  }

  const duplicar = async (post: any) => {
    const { id, created_at, updated_at, ...rest } = post
    const { data } = await supabase.from('content_posts')
      .insert({ ...rest, status:'rascunho', title:(rest.title??'')+' (cópia)' }).select().single()
    if (data) setItems(prev => [data,...prev])
  }

  const salvarData = async (id: string) => {
    await supabase.from('content_posts').update({ scheduled_at: editDate, status:'agendado' }).eq('id', id)
    setItems(prev => prev.map(p => p.id===id ? {...p, scheduled_at:editDate, status:'agendado'} : p))
    setEditId(null)
  }

  const marcarPublicado = async (id: string) => {
    await supabase.from('content_posts').update({ status:'publicado', posted_at: new Date().toISOString() }).eq('id', id)
    setItems(prev => prev.map(p => p.id===id ? {...p, status:'publicado'} : p))
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <div>
            <p className="text-xs mb-1 font-medium" style={{ color:'var(--muted)' }}>Canal</p>
            <div className="flex flex-wrap gap-1.5">
              {CHANNELS.map(c => (
                <button key={c} onClick={() => setCanal(c)}
                  className="px-3 py-1 rounded-lg text-xs font-medium border transition-all capitalize"
                  style={{
                    background: canal===c?'var(--brand)':'var(--bg-card)',
                    color:      canal===c?'white':'var(--text-3)',
                    borderColor:canal===c?'var(--brand)':'var(--border)',
                  }}>
                  {CANAL_EMOJI[c] ?? ''} {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs mb-1 font-medium" style={{ color:'var(--muted)' }}>Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS.map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className="px-3 py-1 rounded-lg text-xs font-medium border transition-all capitalize"
                  style={{
                    background: status===s?'var(--brand)':'var(--bg-card)',
                    color:      status===s?'white':'var(--text-3)',
                    borderColor:status===s?'var(--brand)':'var(--border)',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs" style={{ color:'var(--muted)' }}>{filtered.length} conteúdo(s)</p>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center" style={{ color:'var(--muted)' }}>
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Nenhum conteúdo encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <div key={post.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-sm">{CANAL_EMOJI[post.channel] ?? '📄'}</span>
                    <span className="text-xs font-medium capitalize" style={{ color:'var(--text-3)' }}>{post.channel}</span>
                    <span className={STATUS_BADGE[post.status] ?? 'badge-gray'}>{post.status}</span>
                    {post.format && <span className="badge-gray capitalize text-xs">{post.format}</span>}
                  </div>
                  <p className="font-semibold text-sm truncate" style={{ color:'var(--text-1)' }}>
                    {post.title ?? post.product ?? 'Sem título'}
                  </p>
                  {post.scheduled_at ? (
                    <p className="text-xs mt-1" style={{ color:'var(--muted)' }}>
                      📅 {formatDate(post.scheduled_at)}
                    </p>
                  ) : (
                    <p className="text-xs mt-1" style={{ color:'var(--muted)' }}>Sem data agendada</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditId(editId===post.id?null:post.id); setEditDate(post.scheduled_at?.slice(0,16)??'') }}
                    className="btn-ghost p-1.5 text-xs" title="Agendar">
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button onClick={() => duplicar(post)} className="btn-ghost p-1.5" title="Duplicar">
                    <Copy className="w-4 h-4" />
                  </button>
                  {post.status !== 'publicado' && (
                    <button onClick={() => marcarPublicado(post.id)}
                      className="btn-ghost p-1.5 text-green-500" title="Marcar publicado">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => excluir(post.id)}
                    className="btn-ghost p-1.5 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editId === post.id && (
                <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor:'var(--border)' }}>
                  <input type="datetime-local" value={editDate}
                    onChange={e => setEditDate(e.target.value)} className="input flex-1" />
                  <button onClick={() => salvarData(post.id)} className="btn-primary text-sm">
                    Agendar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

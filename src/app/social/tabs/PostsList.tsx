'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Trash2, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react'

const STATUS_BADGE: Record<string,string> = {
  rascunho:'badge-yellow', aprovado:'badge-blue', agendado:'badge bg-purple-100 text-purple-700',
  publicado:'badge-green', ideia:'badge-gray',
}
const STATUS_LABEL: Record<string,string> = {
  rascunho:'Rascunho', aprovado:'Aprovado', agendado:'Agendado', publicado:'Publicado', ideia:'Ideia',
}

export function PostsList({ posts, canal }: { posts: any[]; canal: string }) {
  const supabase = createClient()
  const [items, setItems] = useState(posts)
  const [expandedId, setExpandedId] = useState<string|null>(null)
  const [filter, setFilter] = useState('')

  const filtered = filter ? items.filter(p => p.status === filter) : items

  const marcarPublicado = async (id: string) => {
    await supabase.from('content_posts').update({ status:'publicado', posted_at: new Date().toISOString() }).eq('id', id)
    setItems(prev => prev.map(p => p.id===id ? {...p, status:'publicado'} : p))
  }

  const excluir = async (id: string) => {
    if (!confirm('Excluir este conteúdo?')) return
    await supabase.from('content_posts').delete().eq('id', id)
    setItems(prev => prev.filter(p => p.id !== id))
  }

  const duplicar = async (post: any) => {
    const { id, created_at, updated_at, ...rest } = post
    const { data } = await supabase.from('content_posts').insert({ ...rest, status:'rascunho', title: rest.title+' (cópia)' }).select().single()
    if (data) setItems(prev => [data, ...prev])
  }

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center" style={{ color:'var(--muted)' }}>
        <p className="text-4xl mb-3">📭</p>
        <p>Nenhum conteúdo ainda. Use a aba "Gerar Conteúdo" para criar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filtro */}
      <div className="flex gap-2 flex-wrap">
        {['','rascunho','aprovado','agendado','publicado'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
            style={{
              background: filter===s ? 'var(--brand)' : 'var(--bg-card)',
              color:      filter===s ? 'white' : 'var(--text-3)',
              borderColor: filter===s ? 'var(--brand)' : 'var(--border)',
            }}>
            {s || 'Todos'} {s && `(${items.filter(p=>p.status===s).length})`}
          </button>
        ))}
      </div>

      {filtered.map(post => (
        <div key={post.id} className="card p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={STATUS_BADGE[post.status] ?? 'badge-gray'}>
                  {STATUS_LABEL[post.status]}
                </span>
                {post.format && <span className="badge-gray capitalize">{post.format}</span>}
                {post.motor && <span className="badge-gray capitalize">{post.motor.replace('_',' ')}</span>}
              </div>
              <p className="font-semibold mt-1.5 truncate" style={{ color:'var(--text-1)' }}>
                {post.title ?? post.product ?? 'Sem título'}
              </p>
              {post.product && <p className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>{post.product}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setExpandedId(expandedId===post.id?null:post.id)}
                className="btn-ghost p-1.5" title="Ver conteúdo">
                {expandedId===post.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={() => duplicar(post)} className="btn-ghost p-1.5" title="Duplicar">
                <Copy className="w-4 h-4" />
              </button>
              {post.status !== 'publicado' && (
                <button onClick={() => marcarPublicado(post.id)}
                  className="btn-ghost p-1.5 text-green-500" title="Marcar como publicado">
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => excluir(post.id)}
                className="btn-ghost p-1.5 text-red-400 hover:text-red-600" title="Excluir">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {expandedId === post.id && (
            <div className="space-y-2 pt-2 border-t" style={{ borderColor:'var(--border)' }}>
              {post.caption && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color:'var(--muted)' }}>LEGENDA</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color:'var(--text-2)' }}>{post.caption}</p>
                </div>
              )}
              {post.hashtags && (
                <p className="text-xs" style={{ color:'#2563eb' }}>{post.hashtags}</p>
              )}
              {post.script && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color:'var(--muted)' }}>ROTEIRO</p>
                  <p className="text-xs whitespace-pre-wrap" style={{ color:'var(--text-3)' }}>{post.script}</p>
                </div>
              )}
              {post.best_time && (
                <p className="text-xs" style={{ color:'var(--muted)' }}>🕐 Melhor horário: {post.best_time}</p>
              )}
              {post.scheduled_at && (
                <p className="text-xs" style={{ color:'var(--muted)' }}>📅 Agendado: {formatDate(post.scheduled_at)}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

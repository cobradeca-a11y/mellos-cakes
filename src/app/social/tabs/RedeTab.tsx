'use client'

import { useState } from 'react'
import { MotorIA } from './MotorIA'
import { PostsList } from './PostsList'
import { Sparkles, List } from 'lucide-react'

interface Props { canal: string; posts: any[] }

const CANAL_LABEL: Record<string,string> = {
  instagram:'Instagram', facebook:'Facebook', tiktok:'TikTok', youtube:'YouTube Shorts'
}
const CANAL_COLOR: Record<string,string> = {
  instagram:'#e1306c', facebook:'#1877f2', tiktok:'#010101', youtube:'#ff0000'
}

export function RedeTab({ canal, posts }: Props) {
  const [view, setView] = useState<'gerar'|'rascunhos'>('gerar')
  const label = CANAL_LABEL[canal] ?? canal
  const color = CANAL_COLOR[canal] ?? '#e55c28'

  const rascunhos  = posts.filter(p => p.status === 'rascunho')
  const publicados = posts.filter(p => p.status === 'publicado')

  return (
    <div className="space-y-5">
      {/* Sub-abas */}
      <div className="flex gap-2">
        {[
          { id:'gerar',     label:'✨ Gerar Conteúdo',  icon: Sparkles },
          { id:'rascunhos', label:`📝 Rascunhos (${rascunhos.length})`, icon: List },
        ].map(v => (
          <button key={v.id} onClick={() => setView(v.id as any)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all"
            style={{
              borderColor: view===v.id ? color : 'var(--border)',
              background:  view===v.id ? color : 'var(--bg-card)',
              color:       view===v.id ? 'white' : 'var(--text-3)',
            }}>
            {v.label}
          </button>
        ))}
        <div className="ml-auto text-xs flex items-center gap-2" style={{ color:'var(--muted)' }}>
          <span className="badge-green">{publicados.length} publicados</span>
        </div>
      </div>

      {view === 'gerar' && (
        <div className="card p-6">
          <h2 className="font-semibold mb-5 flex items-center gap-2" style={{ color:'var(--text-1)' }}>
            <span className="text-lg">✨</span> Gerar conteúdo para {label}
          </h2>
          <MotorIA canal={canal} onSaved={() => setView('rascunhos')} />
        </div>
      )}

      {view === 'rascunhos' && (
        <PostsList posts={posts} canal={canal} />
      )}
    </div>
  )
}

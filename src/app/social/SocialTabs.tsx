'use client'

import { useState } from 'react'
import { CalendarioTab }  from './tabs/CalendarioTab'
import { RedeTab }        from './tabs/RedeTab'
import { WhatsAppTab }    from './tabs/WhatsAppTab'
import { CampanhasTab }   from './tabs/CampanhasTab'
import { RelatoriosSocialTab } from './tabs/RelatoriosSocialTab'
import {
  Calendar, Instagram, Facebook, Music2, Youtube,
  MessageCircle, Megaphone, BarChart2
} from 'lucide-react'

const TABS = [
  { id: 'calendario',  label: 'Calendário',      icon: Calendar,       color: '#7c3aed' },
  { id: 'instagram',   label: 'Instagram',        icon: Instagram,      color: '#e1306c' },
  { id: 'facebook',    label: 'Facebook',         icon: Facebook,       color: '#1877f2' },
  { id: 'tiktok',      label: 'TikTok',           icon: Music2,         color: '#010101' },
  { id: 'youtube',     label: 'YouTube Shorts',   icon: Youtube,        color: '#ff0000' },
  { id: 'whatsapp',    label: 'WhatsApp',         icon: MessageCircle,  color: '#25d366' },
  { id: 'campanhas',   label: 'Campanhas',        icon: Megaphone,      color: '#f59e0b' },
  { id: 'relatorios',  label: 'Relatórios',       icon: BarChart2,      color: '#0891b2' },
]

const REDE_CHANNELS: Record<string, string> = {
  instagram: 'instagram',
  facebook: 'facebook',
  tiktok: 'tiktok',
  youtube: 'youtube',
}

export function SocialTabs({ posts, campaigns, templates }: {
  posts: any[]; campaigns: any[]; templates: any[]
}) {
  const [activeTab, setActiveTab] = useState('calendario')
  const tab = TABS.find(t => t.id === activeTab)!

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="page-title">Redes Sociais</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Geração de conteúdo com IA + gestão editorial
        </p>
      </div>

      {/* Abas */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0"
            style={{
              background: activeTab === t.id ? t.color : 'var(--bg-card)',
              color:      activeTab === t.id ? 'white'  : 'var(--text-3)',
              border:     `1px solid ${activeTab === t.id ? t.color : 'var(--border)'}`,
              boxShadow:  activeTab === t.id ? `0 2px 10px ${t.color}44` : 'none',
            }}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {activeTab === 'calendario' && (
        <CalendarioTab posts={posts} />
      )}
      {['instagram','facebook','tiktok','youtube'].includes(activeTab) && (
        <RedeTab canal={activeTab} posts={posts.filter(p => p.channel === REDE_CHANNELS[activeTab] || p.channel === activeTab)} />
      )}
      {activeTab === 'whatsapp' && (
        <WhatsAppTab templates={templates} />
      )}
      {activeTab === 'campanhas' && (
        <CampanhasTab campaigns={campaigns} />
      )}
      {activeTab === 'relatorios' && (
        <RelatoriosSocialTab posts={posts} />
      )}
    </div>
  )
}

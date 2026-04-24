'use client'

import { useState } from 'react'
import { CalendarioTab }       from './tabs/CalendarioTab'
import { RedeTab }             from './tabs/RedeTab'
import { WhatsAppTab }         from './tabs/WhatsAppTab'
import { CampanhasTab }        from './tabs/CampanhasTab'
import { RelatoriosSocialTab } from './tabs/RelatoriosSocialTab'
import {
  Calendar, Instagram, Facebook, Music2, Youtube,
  MessageCircle, Megaphone, BarChart2, ChevronDown
} from 'lucide-react'

const TABS = [
  { id:'calendario', label:'Calendário',    icon:Calendar,      color:'#7c3aed' },
  { id:'instagram',  label:'Instagram',     icon:Instagram,     color:'#e1306c' },
  { id:'facebook',   label:'Facebook',      icon:Facebook,      color:'#1877f2' },
  { id:'tiktok',     label:'TikTok',        icon:Music2,        color:'#333333' },
  { id:'youtube',    label:'YT Shorts',     icon:Youtube,       color:'#ff0000' },
  { id:'whatsapp',   label:'WhatsApp',      icon:MessageCircle, color:'#25d366' },
  { id:'campanhas',  label:'Campanhas',     icon:Megaphone,     color:'#f59e0b' },
  { id:'relatorios', label:'Relatórios',    icon:BarChart2,     color:'#0891b2' },
]

const REDE_CHANNELS: Record<string,string> = {
  instagram:'instagram', facebook:'facebook', tiktok:'tiktok', youtube:'youtube',
}

export function SocialTabs({ posts, campaigns, templates }: {
  posts: any[]; campaigns: any[]; templates: any[]
}) {
  const [activeTab, setActiveTab] = useState('calendario')
  const [mobileOpen, setMobileOpen] = useState(false)
  const tab = TABS.find(t => t.id === activeTab)!

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="page-title">Redes Sociais</h1>
        <p className="text-sm mt-0.5" style={{ color:'var(--muted)' }}>
          Geração de conteúdo com IA + calendário editorial
        </p>
      </div>

      {/* Desktop: abas em linha única com scroll */}
      <div className="hidden md:flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0"
            style={{
              background: activeTab===t.id ? t.color : 'var(--bg-card)',
              color:      activeTab===t.id ? 'white'  : 'var(--text-3)',
              border:     `1px solid ${activeTab===t.id ? t.color : 'var(--border)'}`,
              boxShadow:  activeTab===t.id ? `0 2px 10px ${t.color}44` : 'none',
            }}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Mobile: dropdown compacto */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all"
          style={{ background: tab.color, boxShadow: `0 2px 12px ${tab.color}55` }}
        >
          <span className="flex items-center gap-2">
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
        </button>

        {mobileOpen && (
          <div className="mt-1 rounded-xl overflow-hidden border animate-fade-in"
            style={{ borderColor:'var(--border)', background:'var(--bg-card)' }}>
            {TABS.filter(t => t.id !== activeTab).map(t => (
              <button key={t.id}
                onClick={() => { setActiveTab(t.id); setMobileOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--hover)] border-b last:border-0"
                style={{ borderColor:'var(--border-light)', color:'var(--text-2)' }}
              >
                <t.icon className="w-4 h-4 shrink-0" style={{ color: t.color }} />
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div>
        {activeTab === 'calendario' && <CalendarioTab posts={posts} />}
        {['instagram','facebook','tiktok','youtube'].includes(activeTab) && (
          <RedeTab canal={activeTab} posts={posts.filter(p => p.channel === activeTab)} />
        )}
        {activeTab === 'whatsapp'   && <WhatsAppTab templates={templates} />}
        {activeTab === 'campanhas'  && <CampanhasTab campaigns={campaigns} />}
        {activeTab === 'relatorios' && <RelatoriosSocialTab posts={posts} />}
      </div>
    </div>
  )
}

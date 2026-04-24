'use client'

import { useState, useRef } from 'react'
import { formatCurrency } from '@/lib/utils'
import {
  TrendingUp, Calendar, BarChart2, Package, Users, Download,
  DollarSign, ShoppingBag, Percent, Wallet
} from 'lucide-react'

// ── Barra de progresso ──────────────────────────────────
function Bar({ value, max, color = '#e55c28' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0
  return (
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--hover)' }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

// ── Linha de ranking ────────────────────────────────────
function RankRow({ label, value, max, color, suffix = 'x', extra = '' }:
  { label: string; value: number; max: number; color: string; suffix?: string; extra?: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-sm truncate min-w-0 flex-1" style={{ color: 'var(--text-2)' }}>{label}</span>
      <Bar value={value} max={max} color={color} />
      <span className="text-sm font-bold shrink-0 w-10 text-right" style={{ color: 'var(--text-1)' }}>
        {value}{suffix}
      </span>
      {extra && <span className="text-xs shrink-0 w-24 text-right" style={{ color: 'var(--muted)' }}>{extra}</span>}
    </div>
  )
}

// ── Botão exportar PDF ──────────────────────────────────
function ExportButton({ tabName }: { tabName: string }) {
  const handlePrint = () => {
    const style = document.createElement('style')
    style.innerHTML = `
      @media print {
        body > *:not(#print-area) { display: none !important; }
        #print-area { display: block !important; }
        .no-print { display: none !important; }
        @page { margin: 1.5cm; size: A4 portrait; }
        body { background: white !important; color: black !important; font-family: Arial, sans-serif; }
        .card { border: 1px solid #e5e7eb !important; background: white !important; border-radius: 8px; break-inside: avoid; }
      }
    `
    document.head.appendChild(style)
    const area = document.getElementById('print-area')
    if (area) area.id = 'print-area-active'
    document.getElementById('print-area-active')!.style.display = 'block'
    window.print()
    document.head.removeChild(style)
    setTimeout(() => {
      const el = document.getElementById('print-area-active')
      if (el) el.id = 'print-area'
    }, 500)
  }

  return (
    <button
      onClick={handlePrint}
      className="no-print btn-secondary flex items-center gap-2 text-sm"
    >
      <Download className="w-4 h-4" /> Exportar PDF
    </button>
  )
}

// ── Componente principal ────────────────────────────────
interface TabData {
  id: string; label: string; icon: any; color: string
}

const TABS: TabData[] = [
  { id: 'resumo',    label: 'Resumo Executivo',  icon: TrendingUp, color: '#16a34a' },
  { id: 'meses',     label: 'Pedidos por Mês',   icon: Calendar,   color: '#9333ea' },
  { id: 'categorias',label: 'Categorias de Bolo',icon: BarChart2,  color: '#e55c28' },
  { id: 'recheios',  label: 'Recheios',          icon: Package,    color: '#0891b2' },
  { id: 'clientes',  label: 'Clientes',          icon: Users,      color: '#f59e0b' },
]

export function RelatoriosTabs({ data, meses, anoAtual }: {
  data: any; meses: string[]; anoAtual: number
}) {
  const [activeTab, setActiveTab] = useState('resumo')
  const tab = TABS.find(t => t.id === activeTab)!

  const maxMes     = Math.max(...(data.porMes.map(([,v]: any) => v)), 1)
  const maxTam     = Math.max(...data.porTamanho.map(([,v]: any) => v.qty), 1)
  const maxMassa   = Math.max(...data.porMassa.map(([,v]: any) => v), 1)
  const maxCob     = Math.max(...data.porCobertura.map(([,v]: any) => v), 1)
  const maxRecheio = Math.max(...data.porRecheio.map(([,v]: any) => v), 1)
  const maxCliente = Math.max(...data.clientes.map((c: any) => c.pedidos), 1)

  return (
    <div className="space-y-5">
      {/* Header com filtros */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{data.periodo}</p>
        </div>
        <form className="no-print flex flex-wrap gap-2 items-end">
          <div>
            <label className="label text-xs">Ano</label>
            <select name="ano" defaultValue={data.ano} className="input w-auto">
              {[anoAtual, anoAtual-1, anoAtual-2].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Mês</label>
            <select name="mes" defaultValue={data.mes || ''} className="input w-auto">
              <option value="">Ano todo</option>
              {meses.map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary">Filtrar</button>
        </form>
      </div>

      {/* Abas */}
      <div className="no-print flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0"
            style={{
              background:   activeTab === t.id ? t.color : 'var(--bg-card)',
              color:        activeTab === t.id ? 'white'  : 'var(--text-3)',
              border:       `1px solid ${activeTab === t.id ? t.color : 'var(--border)'}`,
              boxShadow:    activeTab === t.id ? `0 2px 12px ${t.color}33` : 'none',
            }}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba */}
      <div id="print-area">

        {/* Cabeçalho de impressão */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#e55c28' }}>MellosCakes — Relatórios</h1>
          <p className="text-sm text-gray-500">{tab.label} • {data.periodo}</p>
          <hr className="mt-3" />
        </div>

        {/* Botão exportar */}
        <div className="no-print flex justify-end mb-4">
          <ExportButton tabName={tab.label} />
        </div>

        {/* ── ABA 1: Resumo Executivo ── */}
        {activeTab === 'resumo' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: DollarSign,  label: 'Faturamento',   value: formatCurrency(data.resumo.receitas),     color: '#16a34a' },
                { icon: TrendingUp,  label: 'Despesas',       value: formatCurrency(data.resumo.despesas),     color: '#dc2626' },
                { icon: Wallet,      label: 'Lucro Líquido',  value: formatCurrency(data.resumo.lucro),        color: data.resumo.lucro>=0?'#2563eb':'#dc2626' },
                { icon: ShoppingBag, label: 'Total Pedidos',  value: String(data.resumo.total_pedidos),        color: '#e55c28' },
                { icon: DollarSign,  label: 'Ticket Médio',   value: formatCurrency(data.resumo.ticket_medio), color: '#9333ea' },
                { icon: Percent,     label: 'Margem',         value: `${data.resumo.margem.toFixed(1)}%`,       color: data.resumo.margem>=30?'#16a34a':'#dc2626' },
              ].map(c => (
                <div key={c.label} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: c.color + '18' }}>
                      <c.icon className="w-4 h-4" style={{ color: c.color }} />
                    </div>
                    <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{c.label}</p>
                  </div>
                  <p className="text-2xl font-display font-bold" style={{ color: c.color }}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Fluxo projetado */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>💰 Fluxo de Caixa Projetado</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Saldo Atual',     value: data.fluxo.saldo_atual,     color: data.fluxo.saldo_atual>=0?'#16a34a':'#dc2626' },
                  { label: 'A Receber',        value: data.fluxo.a_receber,       color: '#2563eb' },
                  { label: 'A Pagar',          value: data.fluxo.a_pagar,         color: '#dc2626' },
                  { label: 'Saldo Projetado',  value: data.fluxo.saldo_projetado, color: data.fluxo.saldo_projetado>=0?'#0891b2':'#dc2626' },
                ].map(c => (
                  <div key={c.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--hover)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{c.label}</p>
                    <p className="font-bold" style={{ color: c.color }}>{formatCurrency(c.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ABA 2: Pedidos por mês ── */}
        {activeTab === 'meses' && (
          <div className="card p-6 space-y-2">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Volume de pedidos por mês</h3>
            {data.porMes.length === 0 ? (
              <p className="text-center py-10 text-sm" style={{ color: 'var(--muted)' }}>
                Nenhum pedido no período selecionado
              </p>
            ) : data.porMes.map(([m, qty]: any) => {
              const [y, mo] = m.split('-')
              const label = `${meses[Number(mo)-1]} ${y}`
              const pct = maxMes > 0 ? (qty/maxMes*100).toFixed(0) : 0
              return (
                <div key={m} className="flex items-center gap-3 py-2">
                  <span className="text-sm w-32 shrink-0" style={{ color: 'var(--text-2)' }}>{label}</span>
                  <div className="flex-1 h-7 rounded-xl overflow-hidden relative" style={{ background: 'var(--hover)' }}>
                    <div className="h-full rounded-xl transition-all"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #e55c28, #fb923c)' }} />
                    <span className="absolute inset-0 flex items-center px-3 text-xs font-semibold"
                      style={{ color: Number(pct) > 20 ? 'white' : 'var(--text-1)' }}>
                      {qty} {qty === 1 ? 'pedido' : 'pedidos'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── ABA 3: Categorias ── */}
        {activeTab === 'categorias' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>📏 Tamanhos</h3>
              {data.porTamanho.length === 0
                ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem dados</p>
                : data.porTamanho.map(([key, v]: any) => (
                  <div key={key} className="mb-3">
                    <RankRow label={`Bolo ${key}`} value={v.qty} max={maxTam} color="#e55c28" />
                    <p className="text-xs pl-1 mt-0.5" style={{ color: 'var(--muted)' }}>
                      {formatCurrency(v.receita)} em receita
                    </p>
                  </div>
                ))
              }
            </div>

            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>🍰 Massas</h3>
              {data.porMassa.length === 0
                ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem dados</p>
                : data.porMassa.map(([nome, qty]: any) => (
                  <RankRow key={nome} label={nome} value={qty} max={maxMassa} color="#7c3aed" />
                ))
              }
            </div>

            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>✨ Coberturas</h3>
              {data.porCobertura.length === 0
                ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem dados</p>
                : data.porCobertura.map(([nome, qty]: any) => (
                  <RankRow key={nome} label={nome} value={qty} max={maxCob} color="#0891b2" />
                ))
              }
            </div>
          </div>
        )}

        {/* ── ABA 4: Recheios ── */}
        {activeTab === 'recheios' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-1)' }}>🔥 Mais pedidos</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Do mais ao menos vendido</p>
              {data.porRecheio.length === 0
                ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem dados</p>
                : data.porRecheio.map(([nome, qty]: any) => (
                  <RankRow key={nome} label={nome} value={qty} max={maxRecheio} color="#16a34a" />
                ))
              }
            </div>
            <div className="card p-5">
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-1)' }}>🧊 Menos pedidos</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Do menos ao mais vendido</p>
              {data.porRecheio.length === 0
                ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem dados</p>
                : [...data.porRecheio].reverse().map(([nome, qty]: any) => (
                  <RankRow key={nome} label={nome} value={qty} max={maxRecheio} color="#dc2626" />
                ))
              }
            </div>
          </div>
        )}

        {/* ── ABA 5: Clientes ── */}
        {activeTab === 'clientes' && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <th>Cliente</th>
                  <th>Pedidos</th>
                  <th>Total Gasto</th>
                  <th>Ticket Médio</th>
                  <th>Classificação</th>
                </tr>
              </thead>
              <tbody>
                {data.clientes.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10" style={{ color: 'var(--muted)' }}>
                    Nenhum dado no período
                  </td></tr>
                ) : data.clientes.slice(0, 15).map((c: any, i: number) => {
                  const ticket = c.total / c.pedidos
                  const medalha = i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`
                  const classe = c.pedidos>=5 ? { label:'⭐ VIP', cls:'badge-green' }
                               : c.pedidos>=3 ? { label:'Frequente', cls:'badge-yellow' }
                               : { label:'Nova', cls:'badge-gray' }
                  return (
                    <tr key={c.nome}>
                      <td className="font-bold text-center text-base">{medalha}</td>
                      <td className="font-medium" style={{ color: 'var(--text-1)' }}>{c.nome}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: 'var(--text-1)' }}>{c.pedidos}</span>
                          <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--hover)' }}>
                            <div className="h-full rounded-full"
                              style={{ width:`${(c.pedidos/maxCliente)*100}%`, background:'#e55c28' }} />
                          </div>
                        </div>
                      </td>
                      <td className="font-semibold" style={{ color: 'var(--text-1)' }}>{formatCurrency(c.total)}</td>
                      <td style={{ color: 'var(--text-3)' }}>{formatCurrency(ticket)}</td>
                      <td><span className={classe.cls}>{classe.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* CSS de impressão */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          nav, aside, header { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
          body { background: white !important; }
          .card { border: 1px solid #e5e7eb !important; background: white !important; }
          * { color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}

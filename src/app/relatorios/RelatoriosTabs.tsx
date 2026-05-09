'use client'

import { useState } from 'react'
import { PrintStyles } from './PrintStyles'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  TrendingUp, Calendar, BarChart2, Package, Users, Download,
  DollarSign, ShoppingBag, Percent, Wallet, ReceiptText, AlertTriangle,
  Warehouse, ClipboardList
} from 'lucide-react'

function Bar({ value, max, color = '#e55c28' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0
  return (
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--hover)' }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function RankRow({ label, value, max, color, suffix = 'x', extra = '' }:
  { label: string; value: number; max: number; color: string; suffix?: string; extra?: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-sm truncate min-w-0 flex-1" style={{ color: 'var(--text-2)' }}>{label}</span>
      <Bar value={value} max={max} color={color} />
      <span className="text-sm font-bold shrink-0 w-14 text-right" style={{ color: 'var(--text-1)' }}>
        {value}{suffix}
      </span>
      {extra && <span className="text-xs shrink-0 w-28 text-right" style={{ color: 'var(--muted)' }}>{extra}</span>}
    </div>
  )
}

function MoneyRow({ label, value, strong = false, final = false }: { label: string; value: number; strong?: boolean; final?: boolean }) {
  const color = value >= 0 ? '#16a34a' : '#dc2626'
  return (
    <div className={`flex items-center justify-between gap-3 py-2 ${final ? 'border-t border-[var(--border)] mt-2 pt-3' : ''}`}>
      <span className={strong || final ? 'font-semibold' : 'text-sm'} style={{ color: 'var(--text-2)' }}>{label}</span>
      <span className={final ? 'text-lg font-bold' : strong ? 'font-bold' : 'font-semibold'} style={{ color }}>{formatCurrency(value)}</span>
    </div>
  )
}

function ExportButton() {
  return (
    <button onClick={() => window.print()} className="no-print btn-secondary flex items-center gap-2 text-sm">
      <Download className="w-4 h-4" /> Exportar PDF
    </button>
  )
}

interface TabData {
  id: string; label: string; icon: any; color: string
}

const TABS: TabData[] = [
  { id: 'resumo',     label: 'Resumo Executivo', icon: TrendingUp,  color: '#16a34a' },
  { id: 'financeiro', label: 'Custos e Caixa',   icon: ReceiptText, color: '#dc2626' },
  { id: 'meses',      label: 'Pedidos por Mês',  icon: Calendar,    color: '#9333ea' },
  { id: 'categorias', label: 'Produtos',         icon: BarChart2,   color: '#e55c28' },
  { id: 'recheios',   label: 'Recheios',         icon: Package,     color: '#0891b2' },
  { id: 'clientes',   label: 'Clientes',         icon: Users,       color: '#f59e0b' },
  { id: 'estoque',    label: 'Estoque',          icon: Warehouse,   color: '#2563eb' },
]

export function RelatoriosTabs({ data, meses, anoAtual }: {
  data: any; meses: string[]; anoAtual: number
}) {
  const [activeTab, setActiveTab] = useState('resumo')
  const tab = TABS.find(t => t.id === activeTab)!

  const maxMes     = Math.max(...(data.porMes.map(([,v]: any) => v.pedidos)), 1)
  const maxTam     = Math.max(...data.porTamanho.map(([,v]: any) => v.qty), 1)
  const maxMassa   = Math.max(...data.porMassa.map(([,v]: any) => v), 1)
  const maxCob     = Math.max(...data.porCobertura.map(([,v]: any) => v), 1)
  const maxRecheio = Math.max(...data.porRecheio.map(([,v]: any) => v), 1)
  const maxCliente = Math.max(...data.clientes.map((c: any) => c.pedidos), 1)
  const maxDespesa = Math.max(...data.despesasPorCategoria.map(([,v]: any) => v.total), 1)
  const maxCompraIng = Math.max(...data.comprasPorIngrediente.map(([,v]: any) => v.total), 1)

  return (
    <div className="space-y-5">
      <PrintStyles />

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

      <div className="no-print flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0"
            style={{
              background: activeTab === t.id ? t.color : 'var(--bg-card)',
              color: activeTab === t.id ? 'white' : 'var(--text-3)',
              border: `1px solid ${activeTab === t.id ? t.color : 'var(--border)'}`,
              boxShadow: activeTab === t.id ? `0 2px 12px ${t.color}33` : 'none',
            }}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div id="print-area">
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#e55c28' }}>MellosCakes — Relatórios</h1>
          <p className="text-sm text-gray-500">{tab.label} • {data.periodo}</p>
          <hr className="mt-3" />
        </div>

        <div className="no-print flex justify-end mb-4"><ExportButton /></div>

        {activeTab === 'resumo' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: DollarSign, label: 'Faturamento Bruto', value: formatCurrency(data.resumo.faturamento_bruto), color: '#16a34a' },
                { icon: Package, label: 'Custo Produção', value: formatCurrency(data.resumo.custo_producao), color: '#dc2626' },
                { icon: Wallet, label: 'Lucro Líquido', value: formatCurrency(data.resumo.lucro_liquido), color: data.resumo.lucro_liquido>=0?'#2563eb':'#dc2626' },
                { icon: Percent, label: 'Margem Líquida', value: `${data.resumo.margem_liquida.toFixed(1)}%`, color: data.resumo.margem_liquida>=30?'#16a34a':'#dc2626' },
                { icon: ShoppingBag, label: 'Total Pedidos', value: String(data.resumo.total_pedidos), color: '#e55c28' },
                { icon: DollarSign, label: 'Ticket Médio', value: formatCurrency(data.resumo.ticket_medio), color: '#9333ea' },
                { icon: ReceiptText, label: 'Despesas Operacionais', value: formatCurrency(data.resumo.despesas_operacionais), color: '#dc2626' },
                { icon: Warehouse, label: 'Estoque Valorizado', value: formatCurrency(data.resumo.estoque_valorizado), color: '#0891b2' },
              ].map(c => (
                <div key={c.label} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: c.color + '18' }}>
                      <c.icon className="w-4 h-4" style={{ color: c.color }} />
                    </div>
                    <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{c.label}</p>
                  </div>
                  <p className="text-xl md:text-2xl font-display font-bold" style={{ color: c.color }}>{c.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card p-5">
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>📊 Demonstrativo do Resultado</h3>
                {data.dre.map((r: any) => <MoneyRow key={r.label} label={r.label} value={r.value} strong={r.type === 'result'} final={r.type === 'final'} />)}
                <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
                  Compra de ingrediente é exibida separada do custo vendido para não confundir reposição de estoque com ingrediente já usado nos pedidos.
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>💰 Fluxo de Caixa Projetado</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Saldo Atual', value: data.fluxo.saldo_atual, color: data.fluxo.saldo_atual>=0?'#16a34a':'#dc2626' },
                    { label: 'A Receber', value: data.fluxo.a_receber, color: '#2563eb' },
                    { label: 'A Pagar', value: data.fluxo.a_pagar, color: '#dc2626' },
                    { label: 'Saldo Projetado', value: data.fluxo.saldo_projetado, color: data.fluxo.saldo_projetado>=0?'#0891b2':'#dc2626' },
                  ].map(c => (
                    <div key={c.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--hover)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{c.label}</p>
                      <p className="font-bold" style={{ color: c.color }}>{formatCurrency(c.value)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl p-3" style={{ background: 'var(--hover)' }}>
                    <p style={{ color: 'var(--muted)' }}>Compras de ingredientes no período</p>
                    <p className="font-bold text-[var(--text-1)]">{formatCurrency(data.resumo.compras_ingredientes)}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'var(--hover)' }}>
                    <p style={{ color: 'var(--muted)' }}>Custo médio por pedido</p>
                    <p className="font-bold text-[var(--text-1)]">{formatCurrency(data.resumo.custo_medio_pedido)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                <AlertTriangle className="w-4 h-4 text-yellow-500" /> Alertas gerenciais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl p-3" style={{ background: 'var(--hover)' }}>
                  <p className="font-semibold text-[var(--text-1)]">Ingredientes em baixo estoque</p>
                  <p style={{ color: 'var(--muted)' }}>{data.ingredientesBaixoEstoque.length} item(ns) precisam de atenção</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'var(--hover)' }}>
                  <p className="font-semibold text-[var(--text-1)]">Pedidos sem custo estimado</p>
                  <p style={{ color: 'var(--muted)' }}>{data.pedidosDetalhados.filter((p:any)=>p.custo<=0).length} pedido(s) sem custo informado</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'var(--hover)' }}>
                  <p className="font-semibold text-[var(--text-1)]">Margem líquida</p>
                  <p style={{ color: 'var(--muted)' }}>{data.resumo.margem_liquida.toFixed(1)}% no período filtrado</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Despesas por categoria</h3>
              {data.despesasPorCategoria.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem despesas no período</p> :
                data.despesasPorCategoria.map(([nome, v]: any) => (
                  <RankRow key={nome} label={nome} value={Number(v.total.toFixed(2))} max={maxDespesa} color="#dc2626" suffix="" extra={`${v.lancamentos} lanç.`} />
                ))}
            </div>

            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Compras por fornecedor</h3>
              {data.comprasPorFornecedor.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem compras no período</p> :
                data.comprasPorFornecedor.map(([nome, v]: any) => (
                  <div key={nome} className="flex items-center justify-between py-2 border-b border-[var(--border-light)] last:border-0">
                    <div>
                      <p className="font-medium text-[var(--text-1)]">{nome}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{v.pedidos} pedido(s) de compra</p>
                    </div>
                    <p className="font-bold text-[var(--text-1)]">{formatCurrency(v.total)}</p>
                  </div>
                ))}
            </div>

            <div className="card p-5 lg:col-span-2">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Ingredientes comprados no período</h3>
              {data.comprasPorIngrediente.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem ingredientes comprados</p> :
                data.comprasPorIngrediente.map(([nome, v]: any) => (
                  <RankRow key={nome} label={`${nome} • ${v.quantidade} ${v.unidade}`} value={Number(v.total.toFixed(2))} max={maxCompraIng} color="#e55c28" suffix="" extra={v.categoria} />
                ))}
            </div>
          </div>
        )}

        {activeTab === 'meses' && (
          <div className="card p-6 space-y-2">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Volume, faturamento e custo por mês</h3>
            {data.porMes.length === 0 ? <p className="text-center py-10 text-sm" style={{ color: 'var(--muted)' }}>Nenhum pedido no período selecionado</p> :
              data.porMes.map(([m, v]: any) => {
                const [y, mo] = m.split('-')
                const label = `${meses[Number(mo)-1]} ${y}`
                const pct = maxMes > 0 ? (v.pedidos/maxMes*100).toFixed(0) : 0
                return (
                  <div key={m} className="py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm w-32 shrink-0" style={{ color: 'var(--text-2)' }}>{label}</span>
                      <div className="flex-1 h-7 rounded-xl overflow-hidden relative" style={{ background: 'var(--hover)' }}>
                        <div className="h-full rounded-xl transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #e55c28, #fb923c)' }} />
                        <span className="absolute inset-0 flex items-center px-3 text-xs font-semibold" style={{ color: Number(pct) > 20 ? 'white' : 'var(--text-1)' }}>
                          {v.pedidos} {v.pedidos === 1 ? 'pedido' : 'pedidos'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs ml-32 mt-1" style={{ color: 'var(--muted)' }}>
                      Faturamento {formatCurrency(v.faturamento)} • Custo {formatCurrency(v.custo)} • Lucro bruto {formatCurrency(v.lucro)}
                    </p>
                  </div>
                )
              })}
          </div>
        )}

        {activeTab === 'categorias' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>📏 Tamanhos</h3>
              {data.porTamanho.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem dados</p> : data.porTamanho.map(([key, v]: any) => (
                <div key={key} className="mb-3">
                  <RankRow label={`Bolo ${key}`} value={v.qty} max={maxTam} color="#e55c28" />
                  <p className="text-xs pl-1 mt-0.5" style={{ color: 'var(--muted)' }}>{formatCurrency(v.receita)} em receita</p>
                </div>
              ))}
            </div>
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>🍰 Massas</h3>
              {data.porMassa.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem dados</p> : data.porMassa.map(([nome, qty]: any) => <RankRow key={nome} label={nome} value={qty} max={maxMassa} color="#7c3aed" />)}
            </div>
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>✨ Coberturas</h3>
              {data.porCobertura.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem dados</p> : data.porCobertura.map(([nome, qty]: any) => <RankRow key={nome} label={nome} value={qty} max={maxCob} color="#0891b2" />)}
            </div>

            <div className="table-container md:col-span-3">
              <div className="px-5 py-4 border-b border-[var(--border-light)]"><h3 className="font-semibold text-[var(--text-1)] flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Pedidos detalhados</h3></div>
              <table className="table">
                <thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Faturamento</th><th>Custo</th><th>Lucro Bruto</th></tr></thead>
                <tbody>
                  {data.pedidosDetalhados.length === 0 ? <tr><td colSpan={6} className="text-center py-10 text-[var(--muted)]">Nenhum pedido no período</td></tr> :
                    data.pedidosDetalhados.map((p:any) => (
                      <tr key={p.numero}>
                        <td className="font-medium text-[var(--text-1)]">{p.numero}</td>
                        <td>{p.cliente}</td>
                        <td>{p.data ? formatDate(p.data) : '—'}</td>
                        <td className="font-semibold">{formatCurrency(p.faturamento)}</td>
                        <td className="text-red-500">{formatCurrency(p.custo)}</td>
                        <td className={p.lucro >= 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>{formatCurrency(p.lucro)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'recheios' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-1)' }}>🔥 Mais pedidos</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Do mais ao menos vendido</p>
              {data.porRecheio.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem dados</p> : data.porRecheio.map(([nome, qty]: any) => <RankRow key={nome} label={nome} value={qty} max={maxRecheio} color="#16a34a" />)}
            </div>
            <div className="card p-5">
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-1)' }}>🧊 Menos pedidos</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Do menos ao mais vendido</p>
              {data.porRecheio.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem dados</p> : [...data.porRecheio].reverse().map(([nome, qty]: any) => <RankRow key={nome} label={nome} value={qty} max={maxRecheio} color="#dc2626" />)}
            </div>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="table-container">
            <table className="table">
              <thead><tr><th className="w-10">#</th><th>Cliente</th><th>Pedidos</th><th>Total Gasto</th><th>Ticket Médio</th><th>Classificação</th></tr></thead>
              <tbody>
                {data.clientes.length === 0 ? <tr><td colSpan={6} className="text-center py-10" style={{ color: 'var(--muted)' }}>Nenhum dado no período</td></tr> : data.clientes.slice(0, 20).map((c: any, i: number) => {
                  const ticket = c.total / c.pedidos
                  const medalha = i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`
                  const classe = c.pedidos>=5 ? { label:'⭐ VIP', cls:'badge-green' } : c.pedidos>=3 ? { label:'Frequente', cls:'badge-yellow' } : { label:'Nova', cls:'badge-gray' }
                  return (
                    <tr key={c.nome}>
                      <td className="font-bold text-center text-base">{medalha}</td>
                      <td className="font-medium" style={{ color: 'var(--text-1)' }}>{c.nome}</td>
                      <td><div className="flex items-center gap-2"><span className="font-bold" style={{ color: 'var(--text-1)' }}>{c.pedidos}</span><div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--hover)' }}><div className="h-full rounded-full" style={{ width:`${(c.pedidos/maxCliente)*100}%`, background:'#e55c28' }} /></div></div></td>
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

        {activeTab === 'estoque' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Estoque valorizado por categoria</h3>
              {data.estoquePorCategoria.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Sem estoque cadastrado</p> :
                data.estoquePorCategoria.map(([nome, v]: any) => (
                  <div key={nome} className="flex items-center justify-between py-2 border-b border-[var(--border-light)] last:border-0">
                    <div><p className="font-medium text-[var(--text-1)]">{nome}</p><p className="text-xs" style={{ color: 'var(--muted)' }}>{v.itens} ingrediente(s)</p></div>
                    <p className="font-bold text-[var(--text-1)]">{formatCurrency(v.valor)}</p>
                  </div>
                ))}
            </div>
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Ingredientes com estoque baixo</h3>
              {data.ingredientesBaixoEstoque.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Nenhum ingrediente abaixo do mínimo</p> :
                data.ingredientesBaixoEstoque.map((ing: any) => (
                  <div key={ing.nome} className="py-2 border-b border-[var(--border-light)] last:border-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-[var(--text-1)]">{ing.nome}</p>
                      <span className="badge-red">baixo</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                      Estoque: {ing.estoque} {ing.unidade} • Mínimo: {ing.minimo} {ing.unidade} • Valor: {formatCurrency(ing.valor_estoque)} • Fornecedor: {ing.fornecedor}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

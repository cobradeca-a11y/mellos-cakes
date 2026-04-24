import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart2, TrendingUp, Users, Package, Calendar, Download
} from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Relatórios' }

async function getReportData(ano: number, mes: number | null) {
  const supabase = createClient()

  const start = mes
    ? `${ano}-${String(mes).padStart(2,'0')}-01`
    : `${ano}-01-01`
  const end = mes
    ? new Date(ano, mes, 0).toISOString().split('T')[0]
    : `${ano}-12-31`

  const [
    { data: cakeItems },
    { data: orders },
    { data: cashflow },
  ] = await Promise.all([
    supabase.from('order_cake_items')
      .select(`
        quantity, base_price, surcharge, total_price,
        size:cake_sizes(name, label),
        flavor1:cake_flavors!order_cake_items_flavor1_id_fkey(name),
        flavor2:cake_flavors!order_cake_items_flavor2_id_fkey(name),
        filling1:cake_fillings!order_cake_items_filling1_id_fkey(name, category),
        filling2:cake_fillings!order_cake_items_filling2_id_fkey(name, category),
        topping:cake_toppings(name),
        orders!inner(delivery_date, status)
      `)
      .gte('orders.delivery_date', start)
      .lte('orders.delivery_date', end)
      .neq('orders.status', 'cancelado'),

    supabase.from('orders')
      .select('id, total_amount, estimated_cost, delivery_date, status, customers(name)')
      .gte('delivery_date', start)
      .lte('delivery_date', end)
      .neq('status', 'cancelado'),

    supabase.from('cashflow_entries')
      .select('amount, type, date, paid')
      .gte('date', start)
      .lte('date', end),
  ])

  // ── Financeiro ──
  const receitas  = (cashflow ?? []).filter(e => e.type === 'receita' && e.paid).reduce((s,e) => s + e.amount, 0)
  const despesas  = (cashflow ?? []).filter(e => e.type === 'despesa' && e.paid).reduce((s,e) => s + e.amount, 0)
  const totalPedidos = orders?.length ?? 0
  const ticketMedio  = totalPedidos > 0 ? (orders ?? []).reduce((s,o) => s + o.total_amount, 0) / totalPedidos : 0

  // ── Tamanhos ──
  const porTamanho: Record<string, { label: string; qty: number; receita: number }> = {}
  ;(cakeItems ?? []).forEach((item: any) => {
    const key = item.size?.name ?? 'N/A'
    if (!porTamanho[key]) porTamanho[key] = { label: item.size?.label ?? key, qty: 0, receita: 0 }
    porTamanho[key].qty     += item.quantity
    porTamanho[key].receita += item.total_price * item.quantity
  })

  // ── Massas ──
  const porMassa: Record<string, number> = {}
  ;(cakeItems ?? []).forEach((item: any) => {
    const f1 = item.flavor1?.name; const f2 = item.flavor2?.name
    if (f1) porMassa[f1] = (porMassa[f1] ?? 0) + item.quantity
    if (f2 && f2 !== f1) porMassa[f2] = (porMassa[f2] ?? 0) + item.quantity
  })

  // ── Recheios ──
  const porRecheio: Record<string, number> = {}
  ;(cakeItems ?? []).forEach((item: any) => {
    const r1 = item.filling1?.name; const r2 = item.filling2?.name
    if (r1) porRecheio[r1] = (porRecheio[r1] ?? 0) + item.quantity
    if (r2) porRecheio[r2] = (porRecheio[r2] ?? 0) + item.quantity
  })

  // ── Coberturas ──
  const porCobertura: Record<string, number> = {}
  ;(cakeItems ?? []).forEach((item: any) => {
    const t = item.topping?.name
    if (t) porCobertura[t] = (porCobertura[t] ?? 0) + item.quantity
  })

  // ── Clientes ──
  const porCliente: Record<string, { nome: string; pedidos: number; total: number }> = {}
  ;(orders ?? []).forEach((o: any) => {
    const nome = o.customers?.name ?? 'Sem nome'
    if (!porCliente[nome]) porCliente[nome] = { nome, pedidos: 0, total: 0 }
    porCliente[nome].pedidos += 1
    porCliente[nome].total   += o.total_amount
  })

  // ── Pedidos por mês ──
  const porMes: Record<string, number> = {}
  ;(orders ?? []).forEach((o: any) => {
    const m = o.delivery_date?.slice(0, 7)
    if (m) porMes[m] = (porMes[m] ?? 0) + 1
  })

  return {
    receitas, despesas, lucro: receitas - despesas,
    totalPedidos, ticketMedio,
    porTamanho, porMassa, porRecheio, porCobertura, porCliente, porMes,
  }
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function Bar({ value, max, color = '#e55c28' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 3) : 0
  return (
    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--hover)' }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default async function RelatoriosPage({ searchParams }: { searchParams: { ano?: string; mes?: string } }) {
  const anoAtual = new Date().getFullYear()
  const ano = Number(searchParams.ano ?? anoAtual)
  const mes = searchParams.mes ? Number(searchParams.mes) : null

  const d = await getReportData(ano, mes)

  const maxTam     = Math.max(...Object.values(d.porTamanho).map(v => v.qty), 1)
  const maxMassa   = Math.max(...Object.values(d.porMassa), 1)
  const maxRecheio = Math.max(...Object.values(d.porRecheio), 1)
  const maxCob     = Math.max(...Object.values(d.porCobertura), 1)
  const maxCliente = Math.max(...Object.values(d.porCliente).map(v => v.pedidos), 1)
  const maxMes     = Math.max(...Object.values(d.porMes), 1)

  const recheiosSorted  = Object.entries(d.porRecheio).sort((a,b) => b[1]-a[1])
  const clientesSorted  = Object.values(d.porCliente).sort((a,b) => b.pedidos-a.pedidos)
  const mesSorted       = Object.entries(d.porMes).sort((a,b) => a[0].localeCompare(b[0]))

  const periodo = mes ? `${MESES[mes-1]} ${ano}` : `Ano ${ano}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{periodo}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <form className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label text-xs">Ano</label>
            <select name="ano" defaultValue={ano} className="input w-auto">
              {[anoAtual, anoAtual-1, anoAtual-2].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Mês (opcional)</label>
            <select name="mes" defaultValue={mes ?? ''} className="input w-auto">
              <option value="">Ano todo</option>
              {MESES.map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary">Filtrar</button>
          {mes && <Link href={`/relatorios?ano=${ano}`} className="btn-secondary text-sm">Limpar filtro</Link>}
        </form>
      </div>

      {/* ── MODELO A: Resumo Executivo ── */}
      <section>
        <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <TrendingUp className="w-5 h-5 text-brand-500" /> A — Resumo Executivo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Faturamento', value: formatCurrency(d.receitas), color: '#16a34a' },
            { label: 'Despesas',    value: formatCurrency(d.despesas), color: '#dc2626' },
            { label: 'Lucro',       value: formatCurrency(d.lucro),    color: d.lucro >= 0 ? '#2563eb' : '#dc2626' },
            { label: 'Ticket Médio',value: formatCurrency(d.ticketMedio), color: '#9333ea' },
          ].map(c => (
            <div key={c.label} className="card p-4 text-center">
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{c.label}</p>
              <p className="text-xl font-display font-bold" style={{ color: c.color }}>{c.value}</p>
            </div>
          ))}
          <div className="card p-4 text-center col-span-2 md:col-span-1">
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Total de Pedidos</p>
            <p className="text-xl font-display font-bold" style={{ color: 'var(--text-1)' }}>{d.totalPedidos}</p>
          </div>
          <div className="card p-4 text-center col-span-2 md:col-span-1">
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Margem</p>
            <p className="text-xl font-display font-bold" style={{ color: d.receitas > 0 ? '#16a34a' : 'var(--muted)' }}>
              {d.receitas > 0 ? ((d.lucro / d.receitas) * 100).toFixed(1) + '%' : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* ── MODELO B: Mapa de pedidos por mês ── */}
      <section>
        <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <Calendar className="w-5 h-5 text-brand-500" /> B — Pedidos por Mês
        </h2>
        <div className="card p-5">
          {mesSorted.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Nenhum pedido no período</p>
          ) : (
            <div className="space-y-3">
              {mesSorted.map(([m, qty]) => {
                const [y, mo] = m.split('-')
                return (
                  <div key={m} className="flex items-center gap-3">
                    <p className="text-sm w-28 shrink-0" style={{ color: 'var(--text-2)' }}>{MESES[Number(mo)-1]} {y}</p>
                    <Bar value={qty} max={maxMes} color="#e55c28" />
                    <p className="text-sm font-bold w-8 text-right shrink-0" style={{ color: 'var(--text-1)' }}>{qty}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── MODELO C: Ranking de Tamanhos, Massas, Coberturas ── */}
      <section>
        <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <BarChart2 className="w-5 h-5 text-brand-500" /> C — Categorias de Bolo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Tamanhos */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-1)' }}>📏 Tamanhos</h3>
            {Object.entries(d.porTamanho).length === 0
              ? <p className="text-sm" style={{ color: 'var(--muted)' }}>Sem dados</p>
              : Object.entries(d.porTamanho).sort((a,b) => b[1].qty - a[1].qty).map(([key, v]) => (
                <div key={key} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Bolo {key} — {v.label}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{v.qty}</span>
                  </div>
                  <Bar value={v.qty} max={maxTam} color="#e55c28" />
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{formatCurrency(v.receita)} em receita</p>
                </div>
              ))
            }
          </div>

          {/* Massas */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-1)' }}>🍫 Massas</h3>
            {Object.entries(d.porMassa).length === 0
              ? <p className="text-sm" style={{ color: 'var(--muted)' }}>Sem dados</p>
              : Object.entries(d.porMassa).sort((a,b) => b[1]-a[1]).map(([nome, qty]) => (
                <div key={nome} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{nome}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{qty}</span>
                  </div>
                  <Bar value={qty} max={maxMassa} color="#7c3aed" />
                </div>
              ))
            }
          </div>

          {/* Coberturas */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-1)' }}>🎂 Coberturas</h3>
            {Object.entries(d.porCobertura).length === 0
              ? <p className="text-sm" style={{ color: 'var(--muted)' }}>Sem dados</p>
              : Object.entries(d.porCobertura).sort((a,b) => b[1]-a[1]).map(([nome, qty]) => (
                <div key={nome} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{nome}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{qty}</span>
                  </div>
                  <Bar value={qty} max={maxCob} color="#0891b2" />
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* ── MODELO D: Recheios mais e menos pedidos ── */}
      <section>
        <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <Package className="w-5 h-5 text-brand-500" /> D — Recheios (mais e menos saída)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4 text-green-600">🔥 Mais pedidos</h3>
            {recheiosSorted.length === 0
              ? <p className="text-sm" style={{ color: 'var(--muted)' }}>Sem dados</p>
              : recheiosSorted.slice(0, 8).map(([nome, qty]) => (
                <div key={nome} className="mb-2.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--text-2)' }}>{nome}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>{qty}x</span>
                  </div>
                  <Bar value={qty} max={maxRecheio} color="#16a34a" />
                </div>
              ))
            }
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4 text-red-500">🧊 Menos pedidos</h3>
            {recheiosSorted.length === 0
              ? <p className="text-sm" style={{ color: 'var(--muted)' }}>Sem dados</p>
              : [...recheiosSorted].reverse().slice(0, 8).map(([nome, qty]) => (
                <div key={nome} className="mb-2.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--text-2)' }}>{nome}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>{qty}x</span>
                  </div>
                  <Bar value={qty} max={maxRecheio} color="#dc2626" />
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* ── MODELO E: Clientes mais assíduas ── */}
      <section>
        <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <Users className="w-5 h-5 text-brand-500" /> E — Clientes mais assíduas
        </h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Pedidos</th>
                <th>Total gasto</th>
                <th>Ticket médio</th>
                <th>Fidelidade</th>
              </tr>
            </thead>
            <tbody>
              {clientesSorted.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--muted)' }}>Sem dados no período</td></tr>
              ) : (
                clientesSorted.slice(0, 10).map((c, i) => {
                  const ticket = c.total / c.pedidos
                  const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}º`
                  return (
                    <tr key={c.nome}>
                      <td className="font-bold text-center" style={{ color: 'var(--brand)' }}>{medalha}</td>
                      <td className="font-medium" style={{ color: 'var(--text-1)' }}>{c.nome}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: 'var(--text-1)' }}>{c.pedidos}</span>
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--hover)' }}>
                            <div className="h-full rounded-full" style={{ width: `${(c.pedidos/maxCliente)*100}%`, background: '#e55c28' }} />
                          </div>
                        </div>
                      </td>
                      <td className="font-semibold" style={{ color: 'var(--text-1)' }}>{formatCurrency(c.total)}</td>
                      <td style={{ color: 'var(--text-3)' }}>{formatCurrency(ticket)}</td>
                      <td>
                        <span className={c.pedidos >= 5 ? 'badge-green' : c.pedidos >= 3 ? 'badge-yellow' : 'badge-gray'}>
                          {c.pedidos >= 5 ? '⭐ VIP' : c.pedidos >= 3 ? 'Frequente' : 'Nova'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}

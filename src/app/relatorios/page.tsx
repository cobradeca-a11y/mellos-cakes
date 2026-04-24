import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import {
  BarChart2, TrendingUp, Users, Package, DollarSign,
  Download, Calendar, Star, ArrowRight
} from 'lucide-react'

export const metadata = { title: 'Relatórios' }

async function getData(mes: string) {
  const supabase = createClient()
  const [year, month] = mes.split('-').map(Number)
  const start = `${year}-${String(month).padStart(2,'0')}-01`
  const end   = new Date(year, month, 0).toISOString().split('T')[0]

  const [
    { data: orders },
    { data: cashflow },
    { data: allOrders },
  ] = await Promise.all([
    supabase.from('orders')
      .select('id, total_amount, created_at, delivery_date, status, order_items(description, cake_size_code, cake_mass_1, cake_mass_2, cake_filling_1, cake_filling_2, cake_topping, total_price)')
      .gte('created_at', start).lte('created_at', end + 'T23:59:59')
      .neq('status', 'cancelado'),
    supabase.from('cashflow_entries')
      .select('type, amount, paid').gte('date', start).lte('date', end),
    supabase.from('orders')
      .select('id, total_amount, created_at, customer_id, customers(name), order_items(cake_size_code, cake_mass_1, cake_mass_2, cake_filling_1, cake_filling_2, cake_topping)')
      .neq('status', 'cancelado')
      .order('created_at', { ascending: true }),
  ])

  return { orders: orders ?? [], cashflow: cashflow ?? [], allOrders: allOrders ?? [] }
}

export default async function RelatoriosPage({ searchParams }: { searchParams: { mes?: string } }) {
  const now = new Date()
  const mes = searchParams.mes ?? `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const { orders, cashflow, allOrders } = await getData(mes)

  // ── Modelo A: Resumo Mensal ──────────────────────────
  const receitas  = cashflow.filter(e => e.type === 'receita' && e.paid).reduce((s,e) => s+e.amount, 0)
  const despesas  = cashflow.filter(e => e.type === 'despesa' && e.paid).reduce((s,e) => s+e.amount, 0)
  const lucro     = receitas - despesas
  const ticketMed = orders.length > 0 ? orders.reduce((s,o) => s + o.total_amount, 0) / orders.length : 0

  // ── Modelo B: Mapa mensal (todos os pedidos agrupados por mês) ──
  const pedidosPorMes: Record<string, number> = {}
  allOrders.forEach((o: any) => {
    const k = o.created_at.slice(0,7)
    pedidosPorMes[k] = (pedidosPorMes[k] ?? 0) + 1
  })
  const maxPedidos = Math.max(...Object.values(pedidosPorMes), 1)

  // ── Modelo C: Rankings ──────────────────────────────
  const clienteMap: Record<string, { name: string; count: number; total: number }> = {}
  allOrders.forEach((o: any) => {
    const id = o.customer_id ?? 'avulso'
    const name = o.customers?.name ?? 'Avulso'
    if (!clienteMap[id]) clienteMap[id] = { name, count: 0, total: 0 }
    clienteMap[id].count++
    clienteMap[id].total += o.total_amount
  })
  const topClientes = Object.values(clienteMap).sort((a,b) => b.count - a.count).slice(0,8)

  // ── Modelo D: Análise por categoria ──────────────────
  const countMap = (key: string) => {
    const map: Record<string, number> = {}
    allOrders.forEach((o: any) => {
      ;(o.order_items ?? []).forEach((item: any) => {
        const val = item[key]
        if (val) map[val] = (map[val] ?? 0) + 1
      })
    })
    return Object.entries(map).sort((a,b) => b[1]-a[1])
  }

  const rankTamanhos  = countMap('cake_size_code')
  const rankMassas    = [...countMap('cake_mass_1'), ...countMap('cake_mass_2')].reduce((acc, [k,v]) => {
    acc[k] = (acc[k]??0)+v; return acc
  }, {} as Record<string,number>)
  const rankMassasArr = Object.entries(rankMassas).sort((a,b)=>b[1]-a[1])

  const rankRecheios  = [...countMap('cake_filling_1'), ...countMap('cake_filling_2')].reduce((acc, [k,v]) => {
    acc[k] = (acc[k]??0)+v; return acc
  }, {} as Record<string,number>)
  const rankRecheiosArr = Object.entries(rankRecheios).sort((a,b)=>b[1]-a[1])

  const rankCoberturas = countMap('cake_topping')

  // ── Modelo E: Fluxo projetado ─────────────────────────
  const pendentesEntrar  = cashflow.filter(e => e.type === 'receita' && !e.paid).reduce((s,e) => s+e.amount, 0)
  const pendentesSair    = cashflow.filter(e => e.type === 'despesa' && !e.paid).reduce((s,e) => s+e.amount, 0)
  const saldoAtual       = receitas - despesas
  const saldoProjetado   = saldoAtual + pendentesEntrar - pendentesSair

  const meses12 = Array.from({length:12}, (_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--muted)' }}>Análise completa do negócio</p>
        </div>
        <form className="flex gap-2 items-center">
          <input type="month" name="mes" defaultValue={mes} className="input w-auto" />
          <button type="submit" className="btn-secondary">Filtrar</button>
        </form>
      </div>

      {/* ═══ MODELO A — Resumo Mensal ════════════════════ */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color:'var(--text-1)' }}>
          <DollarSign className="w-4 h-4 text-green-500" /> A — Resumo Mensal
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label:'Faturamento',   value: formatCurrency(receitas),  sub:'recebido', color:'#16a34a' },
            { label:'Despesas',      value: formatCurrency(despesas),   sub:'pago',     color:'#dc2626' },
            { label:'Lucro Líquido', value: formatCurrency(lucro),      sub:'resultado',color: lucro>=0?'#2563eb':'#dc2626' },
            { label:'Ticket Médio',  value: formatCurrency(ticketMed),  sub:`${orders.length} pedidos`, color:'#e55c28' },
          ].map(c => (
            <div key={c.label} className="card p-4">
              <p className="text-xs font-medium mb-1" style={{ color:'var(--muted)' }}>{c.label}</p>
              <p className="text-xl font-display font-bold" style={{ color:c.color }}>{c.value}</p>
              <p className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>{c.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MODELO B — Mapa de Calor ════════════════════ */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color:'var(--text-1)' }}>
          <Calendar className="w-4 h-4 text-purple-500" /> B — Volume de Pedidos por Mês
        </h2>
        <div className="card p-5">
          <div className="flex gap-2 flex-wrap">
            {meses12.map(m => {
              const qtd = pedidosPorMes[m] ?? 0
              const pct = qtd / maxPedidos
              const bg  = qtd === 0 ? 'var(--hover)'
                        : pct > 0.7 ? '#e55c28'
                        : pct > 0.4 ? '#fb923c'
                        : '#fed7aa'
              const [y, mo] = m.split('-')
              const label = new Date(Number(y), Number(mo)-1, 1).toLocaleDateString('pt-BR', { month:'short', year:'2-digit' })
              return (
                <div key={m} className="flex flex-col items-center gap-1">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all"
                    style={{ background: bg, color: qtd > 0 ? 'white' : 'var(--muted)' }}
                    title={`${label}: ${qtd} pedidos`}
                  >
                    {qtd || '—'}
                  </div>
                  <p className="text-[10px]" style={{ color:'var(--muted)' }}>{label}</p>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-3 mt-4 text-xs" style={{ color:'var(--muted)' }}>
            <span>Menos pedidos</span>
            <div className="flex gap-1">
              {['var(--hover)','#fed7aa','#fb923c','#e55c28'].map(c => (
                <div key={c} className="w-5 h-3 rounded" style={{ background:c }} />
              ))}
            </div>
            <span>Mais pedidos</span>
          </div>
        </div>
      </section>

      {/* ═══ MODELO C — Clientes ════════════════════════ */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color:'var(--text-1)' }}>
          <Users className="w-4 h-4 text-blue-500" /> C — Clientes Mais Assíduas
        </h2>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>#</th><th>Cliente</th><th>Pedidos</th><th>Total Gasto</th><th>Ticket Médio</th></tr></thead>
            <tbody>
              {topClientes.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8" style={{ color:'var(--muted)' }}>Nenhum dado ainda</td></tr>
              ) : topClientes.map((c, i) => (
                <tr key={c.name}>
                  <td>
                    <span className="font-bold" style={{ color: i===0?'#e55c28':i===1?'#78716c':i===2?'#a16207':'var(--muted)' }}>
                      {i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`}
                    </span>
                  </td>
                  <td className="font-medium" style={{ color:'var(--text-1)' }}>{c.name}</td>
                  <td><span className="badge-blue">{c.count}x</span></td>
                  <td className="font-semibold" style={{ color:'var(--text-1)' }}>{formatCurrency(c.total)}</td>
                  <td style={{ color:'var(--text-3)' }}>{formatCurrency(c.total/c.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ MODELO D — Categorias ══════════════════════ */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color:'var(--text-1)' }}>
          <Package className="w-4 h-4 text-orange-500" /> D — Mais e Menos Vendidos por Categoria
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Tamanhos */}
          <RankCard title="Tamanhos" emoji="📏" items={rankTamanhos.map(([k,v]) => ({
            label: k==='P'?'Pequeno (P)':k==='M'?'Médio (M)':'Grande (G)', value:v
          }))} />

          {/* Massas */}
          <RankCard title="Massas" emoji="🍰" items={rankMassasArr.map(([k,v]) => ({ label:k, value:v }))} />

          {/* Recheios */}
          <div className="md:col-span-2">
            <RankCard title="Recheios" emoji="🍫" items={rankRecheiosArr.map(([k,v]) => ({ label:k, value:v }))} />
          </div>

          {/* Coberturas */}
          <RankCard title="Coberturas" emoji="✨" items={rankCoberturas.map(([k,v]) => ({ label:k, value:v }))} />
        </div>
      </section>

      {/* ═══ MODELO E — Fluxo Projetado ════════════════ */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color:'var(--text-1)' }}>
          <TrendingUp className="w-4 h-4 text-cyan-500" /> E — Fluxo de Caixa Projetado
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label:'Saldo Atual',     value: saldoAtual,     color: saldoAtual>=0?'#16a34a':'#dc2626', sub:'recebido − pago' },
            { label:'A Receber',       value: pendentesEntrar, color:'#2563eb', sub:'pendente entrada' },
            { label:'A Pagar',         value: pendentesSair,   color:'#dc2626', sub:'pendente saída' },
            { label:'Saldo Projetado', value: saldoProjetado,  color: saldoProjetado>=0?'#0891b2':'#dc2626', sub:'se tudo pago' },
          ].map(c => (
            <div key={c.label} className="card p-4">
              <p className="text-xs font-medium mb-1" style={{ color:'var(--muted)' }}>{c.label}</p>
              <p className="text-lg font-display font-bold" style={{ color:c.color }}>{formatCurrency(c.value)}</p>
              <p className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>{c.sub}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

// ── Componente auxiliar ──────────────────────────────
function RankCard({ title, emoji, items }: { title: string; emoji: string; items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color:'var(--text-1)' }}>
        {emoji} {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color:'var(--muted)' }}>Sem dados ainda</p>
      ) : items.map((item, i) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="truncate pr-2" style={{ color:'var(--text-2)' }}>{item.label}</span>
            <span className="font-bold shrink-0" style={{ color: i===0?'#e55c28':'var(--text-3)' }}>{item.value}x</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'var(--hover)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(item.value/max)*100}%`,
                background: i===0?'#e55c28':i===items.length-1?'#a8a29e':'#fb923c'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

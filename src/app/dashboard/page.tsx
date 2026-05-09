import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatsCard } from '@/components/ui/StatsCard'
import { AlertaEntrega } from '@/components/ui/AlertaEntrega'
import { ShoppingBag, DollarSign, TrendingUp, AlertTriangle, CalendarDays, ClipboardList } from 'lucide-react'
import Link from 'next/link'

async function getDashboardData() {
  const supabase = createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { data: ordersThisMonth },
    { data: revenueData },
    { data: recentOrders },
    { data: allIngredients },
    { data: upcomingDeliveries },
  ] = await Promise.all([
    supabase.from('orders').select('id, status, total_amount').gte('created_at', startOfMonth),
    supabase.from('cashflow_entries').select('amount, type').gte('date', startOfMonth.split('T')[0]).eq('paid', true),
    supabase.from('orders').select('id, order_number, status, total_amount, delivery_date, customers(name)').order('created_at', { ascending: false }).limit(8),
    supabase.from('ingredients').select('id, stock_quantity, min_stock').eq('active', true),
    supabase.from('deliveries').select('id, scheduled_at, orders(order_number, customers(name))').gte('scheduled_at', now.toISOString()).order('scheduled_at', { ascending: true }).limit(5),
  ])

  const totalRevenue  = (revenueData ?? []).filter(e => e.type === 'receita').reduce((a, e) => a + e.amount, 0)
  const totalExpenses = (revenueData ?? []).filter(e => e.type === 'despesa').reduce((a, e) => a + e.amount, 0)
  const ordersCount   = ordersThisMonth?.length ?? 0
  const activeOrders  = (ordersThisMonth ?? []).filter(o => !['entregue','cancelado'].includes(o.status)).length
  const lowStock      = (allIngredients ?? []).filter(i => i.stock_quantity <= i.min_stock)

  return { totalRevenue, profit: totalRevenue - totalExpenses, ordersCount, activeOrders, lowStock, recentOrders: recentOrders ?? [], upcomingDeliveries: upcomingDeliveries ?? [] }
}

const statusLabel: Record<string,string> = {
  orcamento:'Orçamento', confirmado:'Confirmado', em_producao:'Em Produção',
  finalizado:'Finalizado', entregue:'Entregue', cancelado:'Cancelado',
}
const statusBadge: Record<string,string> = {
  orcamento:'badge-gray', confirmado:'badge-blue', em_producao:'badge-yellow',
  finalizado:'badge-green', entregue:'badge-gray', cancelado:'badge-red',
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Bom dia, <span style={{ color: 'var(--brand)' }}>MellosCakes</span> 🎂
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </p>
      </div>

      {/* ⚠️ Alerta 72h — aparece só quando há pedidos urgentes */}
      <AlertaEntrega />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard title="Faturamento"  value={formatCurrency(data.totalRevenue)} subtitle="Mês atual"                  icon={DollarSign}    color="green"  />
        <StatsCard title="Lucro"        value={formatCurrency(data.profit)}        subtitle="Receitas - Despesas"        icon={TrendingUp}    color="blue"   />
        <StatsCard title="Pedidos"      value={String(data.ordersCount)}           subtitle={`${data.activeOrders} em andamento`} icon={ShoppingBag} color="orange" />
        <StatsCard title="Alertas"      value={String(data.lowStock.length)}       subtitle="Estoque baixo"              icon={AlertTriangle} color="red"    />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Pedidos recentes */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
            <h2 className="font-semibold" style={{ color:'var(--text-1)' }}>Pedidos Recentes</h2>
            <Link href="/pedidos" className="text-sm font-medium" style={{ color:'var(--brand)' }}>Ver todos →</Link>
          </div>
          <div>
            {data.recentOrders.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm" style={{ color:'var(--muted)' }}>
                Nenhum pedido ainda
              </div>
            ) : (
              data.recentOrders.map((order: any) => {
                const entrega = new Date(order.delivery_date)
                const diffH = Math.floor((entrega.getTime() - Date.now()) / (1000*60*60))
                const urgente = diffH >= 0 && diffH <= 72 && !['entregue','cancelado','finalizado'].includes(order.status)

                return (
                  <Link key={order.id} href={`/pedidos/${order.id}`}
                    className="flex items-center justify-between px-5 py-3.5 transition-colors"
                    style={{ borderBottom:'1px solid var(--border-light)' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(229,92,40,0.1)' }}>
                        <ClipboardList className="w-4 h-4" style={{ color:'var(--brand)' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium" style={{ color:'var(--text-1)' }}>
                            {(order.customers as any)?.name ?? 'Cliente'}
                          </p>
                          {urgente && (
                            <span className="badge-yellow text-[10px] px-1.5 py-0 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> {diffH}h
                            </span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color:'var(--muted)' }}>
                          #{order.order_number} • {formatDate(order.delivery_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={statusBadge[order.status] ?? 'badge-gray'}>
                        {statusLabel[order.status]}
                      </span>
                      <span className="text-sm font-semibold" style={{ color:'var(--text-1)' }}>
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Coluna direita */}
        <div className="space-y-4">
          {/* Estoque crítico */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
              <h2 className="font-semibold flex items-center gap-2" style={{ color:'var(--text-1)' }}>
                <AlertTriangle className="w-4 h-4 text-red-500" /> Estoque Crítico
              </h2>
              <Link href="/estoque" className="text-xs font-medium" style={{ color:'var(--brand)' }}>Ver →</Link>
            </div>
            {data.lowStock.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm" style={{ color:'var(--muted)' }}>Tudo em ordem ✓</div>
            ) : (
              data.lowStock.slice(0, 5).map((ing: any) => (
                <div key={ing.id} className="flex items-center justify-between px-5 py-3" style={{ borderBottom:'1px solid var(--border-light)' }}>
                  <p className="text-sm font-medium" style={{ color:'var(--text-1)' }}>{ing.name}</p>
                  <span className="badge-red">{ing.stock_quantity} {ing.unit}</span>
                </div>
              ))
            )}
          </div>

          {/* Próximas entregas */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
              <h2 className="font-semibold flex items-center gap-2" style={{ color:'var(--text-1)' }}>
                <CalendarDays className="w-4 h-4 text-blue-500" /> Próximas Entregas
              </h2>
              <Link href="/entregas" className="text-xs font-medium" style={{ color:'var(--brand)' }}>Ver →</Link>
            </div>
            {data.upcomingDeliveries.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm" style={{ color:'var(--muted)' }}>Nenhuma entrega agendada</div>
            ) : (
              data.upcomingDeliveries.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between px-5 py-3" style={{ borderBottom:'1px solid var(--border-light)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color:'var(--text-1)' }}>{(d.orders as any)?.customers?.name ?? '—'}</p>
                    <p className="text-xs" style={{ color:'var(--muted)' }}>#{(d.orders as any)?.order_number}</p>
                  </div>
                  <span className="text-xs" style={{ color:'var(--text-3)' }}>
                    {d.scheduled_at ? formatDate(d.scheduled_at) : '—'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

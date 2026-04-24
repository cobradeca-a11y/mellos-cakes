import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatsCard } from '@/components/ui/StatsCard'
import { ShoppingBag, DollarSign, TrendingUp, AlertTriangle, CalendarDays, ClipboardList } from 'lucide-react'
import Link from 'next/link'

async function getDashboardData() {
  const supabase = createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const in48h = new Date(now); in48h.setDate(in48h.getDate() + 2)

  const [
    { data: ordersThisMonth },
    { data: revenueData },
    { data: recentOrders },
    { data: lowStockIngredients },
    { data: upcomingDeliveries },
  ] = await Promise.all([
    supabase.from('orders').select('id, status, total_amount').gte('created_at', startOfMonth),
    supabase.from('cashflow_entries').select('amount, type').gte('date', startOfMonth.split('T')[0]).eq('paid', true),
    supabase.from('orders').select('id, order_number, status, total_amount, delivery_date, customers(name)').order('created_at', { ascending: false }).limit(8),
    supabase.from('ingredients').select('id, name, stock_quantity, min_stock, unit').eq('active', true).lt('stock_quantity', 999999).limit(10),
    supabase.from('deliveries').select('id, scheduled_at, status, orders(order_number, customers(name))').gte('scheduled_at', now.toISOString()).order('scheduled_at', { ascending: true }).limit(5),
  ])

  const totalRevenue = (revenueData ?? []).filter(e => e.type === 'receita').reduce((a, e) => a + e.amount, 0)
  const totalExpenses = (revenueData ?? []).filter(e => e.type === 'despesa').reduce((a, e) => a + e.amount, 0)
  const ordersCount = ordersThisMonth?.length ?? 0
  const activeOrders = (ordersThisMonth ?? []).filter(o => !['entregue','cancelado'].includes(o.status)).length
  const lowStock = (lowStockIngredients ?? []).filter(i => i.stock_quantity <= i.min_stock)

  return { totalRevenue, totalExpenses, profit: totalRevenue - totalExpenses, ordersCount, activeOrders, lowStock, recentOrders: recentOrders ?? [], upcomingDeliveries: upcomingDeliveries ?? [] }
}

const statusLabel: Record<string, string> = {
  orcamento: 'Orçamento', confirmado: 'Confirmado', em_producao: 'Em Produção',
  finalizado: 'Finalizado', entregue: 'Entregue', cancelado: 'Cancelado',
}
const statusBadge: Record<string, string> = {
  orcamento: 'badge-gray', confirmado: 'badge-blue', em_producao: 'badge-yellow',
  finalizado: 'badge-green', entregue: 'badge bg-purple-100 text-purple-700', cancelado: 'badge-red',
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Bom dia, <span style={{ color: 'var(--brand)' }}>MellosCakes</span> 🎂
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard title="Faturamento"  value={formatCurrency(data.totalRevenue)}  subtitle="Mês atual"             icon={DollarSign}    color="green"  />
        <StatsCard title="Lucro"        value={formatCurrency(data.profit)}         subtitle="Receitas - Despesas"   icon={TrendingUp}    color="blue"   />
        <StatsCard title="Pedidos"      value={String(data.ordersCount)}            subtitle={`${data.activeOrders} em andamento`} icon={ShoppingBag} color="orange" />
        <StatsCard title="Alertas"      value={String(data.lowStock.length)}        subtitle="Estoque baixo"         icon={AlertTriangle} color="red"    />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Orders */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-1)' }}>Pedidos Recentes</h2>
            <Link href="/pedidos" className="text-sm font-medium" style={{ color: 'var(--brand)' }}>Ver todos →</Link>
          </div>
          <div>
            {data.recentOrders.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm" style={{ color: 'var(--muted)' }}>
                Nenhum pedido ainda
              </div>
            ) : (
              data.recentOrders.map((order: any) => (
                <Link key={order.id} href={`/pedidos/${order.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[var(--hover)]"
                  style={{ borderBottom: '1px solid var(--border-light)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(229,92,40,0.1)' }}>
                      <ClipboardList className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                        {order.customers?.name ?? 'Cliente'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        #{order.order_number} • {formatDate(order.delivery_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={statusBadge[order.status] ?? 'badge-gray'}>
                      {statusLabel[order.status]}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Low Stock */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                <AlertTriangle className="w-4 h-4 text-red-500" /> Estoque Crítico
              </h2>
              <Link href="/estoque" className="text-xs font-medium" style={{ color: 'var(--brand)' }}>Ver →</Link>
            </div>
            <div>
              {data.lowStock.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm" style={{ color: 'var(--muted)' }}>Tudo em ordem ✓</div>
              ) : (
                data.lowStock.map((ing: any) => (
                  <div key={ing.id} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{ing.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>Mínimo: {ing.min_stock} {ing.unit}</p>
                    </div>
                    <span className="badge-red">{ing.stock_quantity} {ing.unit}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Deliveries */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                <CalendarDays className="w-4 h-4 text-blue-500" /> Próximas Entregas
              </h2>
              <Link href="/entregas" className="text-xs font-medium" style={{ color: 'var(--brand)' }}>Ver →</Link>
            </div>
            <div>
              {data.upcomingDeliveries.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm" style={{ color: 'var(--muted)' }}>Nenhuma entrega agendada</div>
              ) : (
                data.upcomingDeliveries.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{d.orders?.customers?.name ?? '—'}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>#{d.orders?.order_number}</p>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                      {d.scheduled_at ? formatDate(d.scheduled_at) : '—'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

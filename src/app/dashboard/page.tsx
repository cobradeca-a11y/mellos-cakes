import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatsCard } from '@/components/ui/StatsCard'
import {
  ShoppingBag, DollarSign, TrendingUp, Users,
  Package, AlertTriangle, CalendarDays, ClipboardList
} from 'lucide-react'
import Link from 'next/link'

async function getDashboardData() {
  const supabase = createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  const [
    { data: ordersThisMonth },
    { data: revenueData },
    { data: pendingOrders },
    { data: lowStockIngredients },
    { data: recentOrders },
    { data: upcomingDeliveries },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status, total_amount')
      .gte('created_at', startOfMonth),
    supabase
      .from('cashflow_entries')
      .select('amount, type')
      .gte('date', startOfMonth.split('T')[0])
      .lte('date', endOfMonth.split('T')[0])
      .eq('paid', true),
    supabase
      .from('orders')
      .select('id, order_number, status, total_amount, delivery_date, customers(name)')
      .in('status', ['confirmado', 'em_producao'])
      .order('delivery_date', { ascending: true })
      .limit(5),
    supabase
      .from('ingredients')
      .select('id, name, stock_quantity, min_stock, unit')
      .filter('stock_quantity', 'lte', 'min_stock')
      .eq('active', true)
      .limit(5),
    supabase
      .from('orders')
      .select('id, order_number, status, total_amount, delivery_date, customers(name)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('deliveries')
      .select('id, scheduled_at, status, orders(order_number, customers(name))')
      .gte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5),
  ])

  const totalRevenue = (revenueData ?? [])
    .filter(e => e.type === 'receita')
    .reduce((acc, e) => acc + e.amount, 0)

  const totalExpenses = (revenueData ?? [])
    .filter(e => e.type === 'despesa')
    .reduce((acc, e) => acc + e.amount, 0)

  const ordersCount = ordersThisMonth?.length ?? 0
  const activeOrders = (ordersThisMonth ?? []).filter(o => !['entregue','cancelado'].includes(o.status)).length

  return {
    totalRevenue,
    totalExpenses,
    profit: totalRevenue - totalExpenses,
    ordersCount,
    activeOrders,
    pendingOrders: pendingOrders ?? [],
    lowStockIngredients: lowStockIngredients ?? [],
    recentOrders: recentOrders ?? [],
    upcomingDeliveries: upcomingDeliveries ?? [],
  }
}

const statusLabel: Record<string, string> = {
  orcamento: 'Orçamento',
  confirmado: 'Confirmado',
  em_producao: 'Em Produção',
  finalizado: 'Finalizado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const statusBadge: Record<string, string> = {
  orcamento: 'badge-gray',
  confirmado: 'badge-blue',
  em_producao: 'badge-yellow',
  finalizado: 'badge-green',
  entregue: 'badge bg-purple-100 text-purple-700',
  cancelado: 'badge-red',
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title font-display">
          Bom dia, <span className="text-brand-500">MellosCakes</span> 🎂
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Resumo do mês atual • {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Faturamento"
          value={formatCurrency(data.totalRevenue)}
          subtitle="Mês atual"
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Lucro"
          value={formatCurrency(data.profit)}
          subtitle="Receitas - Despesas"
          icon={TrendingUp}
          color="blue"
        />
        <StatsCard
          title="Pedidos"
          value={String(data.ordersCount)}
          subtitle={`${data.activeOrders} em andamento`}
          icon={ShoppingBag}
          color="orange"
        />
        <StatsCard
          title="Alertas"
          value={String(data.lowStockIngredients.length)}
          subtitle="Estoque baixo"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900">Pedidos Recentes</h2>
            <Link href="/pedidos" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-neutral-50">
            {data.recentOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-neutral-400">
                Nenhum pedido ainda
              </div>
            ) : (
              data.recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/pedidos/${order.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-brand-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {order.customers?.name ?? 'Cliente'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        #{order.order_number} • {formatDate(order.delivery_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={statusBadge[order.status] ?? 'badge-gray'}>
                      {statusLabel[order.status]}
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sidebar cards */}
        <div className="space-y-4">

          {/* Low Stock Alert */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Estoque Crítico
              </h2>
              <Link href="/estoque" className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                Ver →
              </Link>
            </div>
            <div className="divide-y divide-neutral-50">
              {data.lowStockIngredients.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-neutral-400">
                  Tudo em ordem ✓
                </div>
              ) : (
                data.lowStockIngredients.map((ing: any) => (
                  <div key={ing.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{ing.name}</p>
                      <p className="text-xs text-neutral-400">
                        Mínimo: {ing.min_stock} {ing.unit}
                      </p>
                    </div>
                    <span className="badge-red text-xs">
                      {ing.stock_quantity} {ing.unit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Deliveries */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                Próximas Entregas
              </h2>
              <Link href="/entregas" className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                Ver →
              </Link>
            </div>
            <div className="divide-y divide-neutral-50">
              {data.upcomingDeliveries.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-neutral-400">
                  Nenhuma entrega agendada
                </div>
              ) : (
                data.upcomingDeliveries.map((delivery: any) => (
                  <div key={delivery.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {delivery.orders?.customers?.name ?? 'Cliente'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        #{delivery.orders?.order_number}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {delivery.scheduled_at
                        ? formatDate(delivery.scheduled_at)
                        : '—'}
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

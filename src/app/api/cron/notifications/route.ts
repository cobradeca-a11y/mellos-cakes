import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Called by Vercel Cron or external scheduler
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const notifications: any[] = []
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const in48h = new Date(now)
  in48h.setDate(in48h.getDate() + 2)

  // Get all admin/atendente user IDs
  const { data: users } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'atendente', 'producao'])
    .eq('active', true)

  const userIds = (users ?? []).map(u => u.id)
  if (userIds.length === 0) return NextResponse.json({ ok: true, created: 0 })

  // 1. Low stock ingredients
  const { data: lowStock } = await supabase
    .from('ingredients')
    .select('id, name, stock_quantity, unit, min_stock')
    .eq('active', true)
    .filter('stock_quantity', 'lte', 'min_stock')

  for (const ing of lowStock ?? []) {
    for (const uid of userIds) {
      notifications.push({
        user_id: uid,
        type: 'estoque_baixo',
        title: `Estoque baixo: ${ing.name}`,
        message: `Restam apenas ${ing.stock_quantity} ${ing.unit} (mínimo: ${ing.min_stock} ${ing.unit})`,
        link: `/ingredientes/${ing.id}`,
        read: false,
      })
    }
  }

  // 2. Orders delivering in next 24h
  const { data: urgentOrders } = await supabase
    .from('orders')
    .select('id, order_number, delivery_date, customers(name)')
    .in('status', ['confirmado', 'em_producao'])
    .gte('delivery_date', now.toISOString())
    .lte('delivery_date', in48h.toISOString())

  for (const order of urgentOrders ?? []) {
    for (const uid of userIds) {
      notifications.push({
        user_id: uid,
        type: 'pedido_proximo',
        title: `Entrega em breve: #${order.order_number}`,
        message: `Pedido de ${(order.customers as any)?.name ?? 'cliente'} previsto para ${new Date(order.delivery_date).toLocaleDateString('pt-BR')}`,
        link: `/pedidos/${order.id}`,
        read: false,
      })
    }
  }

  // 3. Quotes pending for > 3 days
  const threeDaysAgo = new Date(now)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const { data: pendingQuotes } = await supabase
    .from('quotes')
    .select('id, quote_number, customers(name)')
    .eq('status', 'enviado')
    .lte('updated_at', threeDaysAgo.toISOString())

  for (const quote of pendingQuotes ?? []) {
    for (const uid of userIds) {
      notifications.push({
        user_id: uid,
        type: 'orcamento',
        title: `Orçamento sem resposta: #${quote.quote_number}`,
        message: `O orçamento para ${(quote.customers as any)?.name ?? 'cliente'} está aguardando resposta há mais de 3 dias.`,
        link: `/orcamentos/${quote.id}`,
        read: false,
      })
    }
  }

  // 4. Unpaid cashflow entries due today or overdue
  const { data: overdue } = await supabase
    .from('cashflow_entries')
    .select('id, description, amount, date')
    .eq('paid', false)
    .lte('date', now.toISOString().split('T')[0])

  for (const entry of overdue ?? []) {
    for (const uid of userIds) {
      notifications.push({
        user_id: uid,
        type: 'financeiro',
        title: `Conta vencida: ${entry.description}`,
        message: `Lançamento de R$ ${entry.amount.toFixed(2)} está em atraso.`,
        link: `/financeiro`,
        read: false,
      })
    }
  }

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications)
  }

  return NextResponse.json({ ok: true, created: notifications.length })
}

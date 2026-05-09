import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { BrainCircuit, CalendarDays, ClipboardCheck, MessageCircle, Sparkles, Target, TrendingUp } from 'lucide-react'

export const metadata = { title: 'Inteligência de Vendas' }

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

function getDateRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

function getNextCommercialDate() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  const dates = [
    { month: 2, day: 14, label: 'Volta às aulas / fevereiro comercial', focus: 'sabores de volume, combos e comunicação simples' },
    { month: 3, day: 8, label: 'Dia da Mulher', focus: 'presentes, delicadeza e sabores especiais' },
    { month: 4, day: 30, label: 'Páscoa / temporada de chocolate', focus: 'chocolate, Nutella, sabores premium e kits presenteáveis' },
    { month: 5, day: 15, label: 'Dia das Mães', focus: 'presente, afeto, família e sabores especiais' },
    { month: 6, day: 12, label: 'Dia dos Namorados', focus: 'chocolate, morango, Nutella e comunicação romântica' },
    { month: 6, day: 30, label: 'Festas Juninas', focus: 'sabores sazonais, cremosos e comunicação temática' },
    { month: 8, day: 15, label: 'Dia dos Pais', focus: 'combos, chocolate e sabores intensos' },
    { month: 10, day: 12, label: 'Dia das Crianças', focus: 'sabores doces, Nutella, Ninho e comunicação divertida' },
    { month: 12, day: 25, label: 'Natal', focus: 'kits, presentes, encomendas antecipadas e sabores especiais' },
  ]

  return dates.find(d => d.month > month || (d.month === month && d.day >= day)) ?? dates[0]
}

function getWeekdayPlan(day: number) {
  const plan: Record<number, { theme: string; action: string; channel: string; time: string }> = {
    0: { theme: 'Família e sobremesa', action: 'Publicar conteúdo afetivo e abrir encomendas da semana.', channel: 'Instagram Stories + WhatsApp', time: '10h30 e 18h30' },
    1: { theme: 'Planejamento da semana', action: 'Mostrar cardápio, sabores disponíveis e bastidores de produção.', channel: 'Stories', time: '09h e 17h' },
    2: { theme: 'Educação e desejo', action: 'Explicar um sabor, textura, camadas e diferencial do pote.', channel: 'Instagram Feed', time: '11h30 ou 18h' },
    3: { theme: 'Prova social', action: 'Publicar feedback, bastidor, entrega ou produto real pronto.', channel: 'Stories + Feed', time: '12h e 19h' },
    4: { theme: 'Antecipação do fim de semana', action: 'Iniciar chamada para pedidos de sexta/sábado.', channel: 'WhatsApp + Stories', time: '11h30 e 18h30' },
    5: { theme: 'Venda direta', action: 'Divulgar produto com maior apelo visual e CTA forte para WhatsApp.', channel: 'Feed + Stories', time: '11h30, 17h30 e 20h' },
    6: { theme: 'Consumo imediato', action: 'Reforçar disponibilidade, retirada/entrega e desejo visual.', channel: 'Stories', time: '10h, 15h e 19h' },
  }

  return plan[day]
}

export default async function InteligenciaVendasPage() {
  const supabase = createClient()
  const last30 = getDateRange(30)
  const last365 = getDateRange(365)
  const today = new Date()
  const weekdayPlan = getWeekdayPlan(today.getDay())
  const nextDate = getNextCommercialDate()

  const [productsRes, orders30Res, ordersYearRes, postsRes] = await Promise.all([
    supabase.from('products').select('id, name, base_price, available, featured, images').eq('business_id', BUSINESS_ID).order('featured', { ascending: false }).order('base_price', { ascending: false }),
    supabase.from('orders').select('id, status, total_amount, estimated_cost, delivery_date, created_at').gte('delivery_date', last30.start).lte('delivery_date', last30.end).neq('status', 'cancelado'),
    supabase.from('orders').select('id, status, total_amount, estimated_cost, delivery_date, created_at').gte('delivery_date', last365.start).lte('delivery_date', last365.end).neq('status', 'cancelado'),
    supabase.from('content_posts').select('id, channel, status, product, motor, best_time, created_at').gte('created_at', last30.start).order('created_at', { ascending: false }).limit(50),
  ])

  const products = productsRes.data ?? []
  const orders30 = orders30Res.data ?? []
  const ordersYear = ordersYearRes.data ?? []
  const posts = postsRes.data ?? []

  const revenue30 = orders30.reduce((sum: number, order: any) => sum + Number(order.total_amount ?? 0), 0)
  const revenueYear = ordersYear.reduce((sum: number, order: any) => sum + Number(order.total_amount ?? 0), 0)
  const avgTicket = orders30.length > 0 ? revenue30 / orders30.length : 0
  const estimatedProfit30 = orders30.reduce((sum: number, order: any) => sum + (Number(order.total_amount ?? 0) - Number(order.estimated_cost ?? 0)), 0)
  const availableProducts = products.filter((p: any) => p.available)
  const priorityProduct = availableProducts.find((p: any) => p.featured) ?? availableProducts[0]
  const premiumProduct = availableProducts.sort((a: any, b: any) => Number(b.base_price ?? 0) - Number(a.base_price ?? 0))[0]
  const contentCount = posts.length

  const recommendation = priorityProduct
    ? `Priorizar ${priorityProduct.name} hoje: está disponível${priorityProduct.featured ? ', marcado como destaque' : ''} e pode ser usado como produto principal da campanha do dia.`
    : 'Cadastre e marque produtos disponíveis para o algoritmo conseguir definir uma prioridade comercial diária.'

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-brand-500" /> Inteligência de Vendas</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">Plano comercial inicial + aprendizado progressivo pelos dados reais da Mello's Cakes.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-brand-500">
          <p className="text-xs text-[var(--text-3)] mb-1">Faturamento 30 dias</p>
          <p className="text-xl font-display font-bold text-[var(--text-1)]">{formatCurrency(revenue30)}</p>
        </div>
        <div className="card p-4 border-l-4 border-green-500">
          <p className="text-xs text-[var(--text-3)] mb-1">Lucro estimado 30 dias</p>
          <p className="text-xl font-display font-bold text-green-600">{formatCurrency(estimatedProfit30)}</p>
        </div>
        <div className="card p-4 border-l-4 border-blue-500">
          <p className="text-xs text-[var(--text-3)] mb-1">Ticket médio 30 dias</p>
          <p className="text-xl font-display font-bold text-blue-600">{formatCurrency(avgTicket)}</p>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <p className="text-xs text-[var(--text-3)] mb-1">Faturamento anual</p>
          <p className="text-xl font-display font-bold text-purple-600">{formatCurrency(revenueYear)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card p-5 xl:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-500" />
            <h2 className="font-semibold text-[var(--text-1)]">Recomendação do dia</h2>
          </div>
          <div className="rounded-xl p-4 bg-[var(--hover)] border border-[var(--border)]">
            <p className="text-sm text-[var(--text-2)]">{recommendation}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl p-4 border border-[var(--border)]">
              <p className="text-xs text-[var(--text-3)] mb-1">Tema do dia</p>
              <p className="font-semibold text-[var(--text-1)]">{weekdayPlan.theme}</p>
            </div>
            <div className="rounded-xl p-4 border border-[var(--border)]">
              <p className="text-xs text-[var(--text-3)] mb-1">Canal</p>
              <p className="font-semibold text-[var(--text-1)]">{weekdayPlan.channel}</p>
            </div>
            <div className="rounded-xl p-4 border border-[var(--border)]">
              <p className="text-xs text-[var(--text-3)] mb-1">Horário inicial</p>
              <p className="font-semibold text-[var(--text-1)]">{weekdayPlan.time}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">Ação orientada</p>
            <p className="text-sm text-[var(--text-2)]">{weekdayPlan.action}</p>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-[var(--text-1)]">Próxima data comercial</h2>
          </div>
          <div>
            <p className="text-lg font-display font-bold text-[var(--text-1)]">{nextDate.label}</p>
            <p className="text-sm text-[var(--text-3)] mt-1">Foco sugerido: {nextDate.focus}.</p>
          </div>
          <div className="rounded-xl p-3 bg-[var(--hover)] border border-[var(--border)]">
            <p className="text-xs text-[var(--text-3)]">Plano inicial: começar campanha com antecedência, alternando bastidor, desejo visual, prova social e venda direta.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="font-semibold text-[var(--text-1)]">Produtos para impulsionar</h2>
          </div>
          {availableProducts.length === 0 ? (
            <p className="text-sm text-[var(--text-3)]">Nenhum produto disponível encontrado.</p>
          ) : (
            <div className="space-y-2">
              {availableProducts.slice(0, 5).map((product: any) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-[var(--border-light)] last:border-0">
                  <div>
                    <p className="font-medium text-[var(--text-1)]">{product.name}</p>
                    <p className="text-xs text-[var(--text-3)]">{product.featured ? 'Destaque no catálogo' : 'Produto disponível'}</p>
                  </div>
                  <p className="font-semibold text-brand-500">{formatCurrency(product.base_price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-[var(--text-1)]">Hipóteses comerciais</h2>
          </div>
          <div className="space-y-2 text-sm text-[var(--text-2)]">
            <p>• Produto premium: {premiumProduct?.name ?? 'cadastre um produto especial para testar'}.</p>
            <p>• Usar posts de desejo visual em sexta/sábado.</p>
            <p>• Usar prova social no meio da semana.</p>
            <p>• Usar enquete em stories antes de vender diretamente.</p>
            <p>• Em datas comerciais, iniciar campanha antes da data.</p>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-[var(--text-1)]">Dados que o professor já enxerga</h2>
          </div>
          <div className="space-y-2 text-sm text-[var(--text-2)]">
            <p>• {products.length} produtos cadastrados.</p>
            <p>• {availableProducts.length} produtos disponíveis.</p>
            <p>• {orders30.length} pedidos nos últimos 30 dias.</p>
            <p>• {ordersYear.length} pedidos no ano móvel.</p>
            <p>• {contentCount} conteúdos/campanhas recentes.</p>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-500" />
          <h2 className="font-semibold text-[var(--text-1)]">Plano inicial de execução</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            ['Manhã', 'Mostrar bastidor, cardápio ou produto do dia.'],
            ['Almoço', 'Publicar foto real/apetitosa com CTA leve.'],
            ['Fim da tarde', 'Reforçar desejo visual e abrir pedidos no WhatsApp.'],
            ['Noite', 'Fechar com urgência leve, prova social ou lembrete.'],
          ].map(([time, action]) => (
            <div key={time} className="rounded-xl p-4 bg-[var(--hover)] border border-[var(--border)]">
              <p className="font-semibold text-[var(--text-1)]">{time}</p>
              <p className="text-sm text-[var(--text-3)] mt-1">{action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

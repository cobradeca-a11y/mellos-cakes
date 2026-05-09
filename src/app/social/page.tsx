import { SocialTabs } from './SocialTabs'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Redes Sociais' }

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

function getWeekdayPlan(day: number) {
  const plan: Record<number, { theme: string; action: string; channel: string; time: string }> = {
    0: { theme: 'Família e sobremesa', action: 'Publicar conteúdo afetivo, explicar como pedir e abrir encomendas da semana.', channel: 'Instagram Stories + WhatsApp', time: '10h30 e 18h30' },
    1: { theme: 'Planejamento da semana', action: 'Mostrar cardápio, sabores disponíveis, formas de pagamento e bastidores de produção.', channel: 'Stories', time: '09h e 17h' },
    2: { theme: 'Educação e desejo', action: 'Explicar um sabor, textura, camadas, diferencial do pote e como conservar.', channel: 'Instagram Feed', time: '11h30 ou 18h' },
    3: { theme: 'Prova social', action: 'Publicar feedback, bastidor, entrega, produto real pronto e chamada para encomendas.', channel: 'Stories + Feed', time: '12h e 19h' },
    4: { theme: 'Antecipação do fim de semana', action: 'Iniciar chamada para pedidos de sexta/sábado com produto prioritário.', channel: 'WhatsApp + Stories', time: '11h30 e 18h30' },
    5: { theme: 'Venda direta explicativa', action: 'Divulgar produto com maior apelo visual explicando sabor, valor percebido, como pedir e prazo.', channel: 'Feed + Stories', time: '11h30, 17h30 e 20h' },
    6: { theme: 'Consumo imediato', action: 'Reforçar disponibilidade, retirada/entrega, desejo visual e chamada direta para WhatsApp.', channel: 'Stories', time: '10h, 15h e 19h' },
  }

  return plan[day]
}

export default async function SocialPage() {
  const supabase = createClient()
  const weekdayPlan = getWeekdayPlan(new Date().getDay())

  const [{ data: posts }, { data: campaigns }, { data: templates }, { data: products }] = await Promise.all([
    supabase.from('content_posts').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('content_campaigns').select('*').order('created_at', { ascending: false }),
    supabase.from('whatsapp_templates').select('*').order('name'),
    supabase.from('products')
      .select('id, name, base_price, available, featured')
      .eq('business_id', BUSINESS_ID)
      .eq('available', true)
      .order('featured', { ascending: false })
      .order('base_price', { ascending: false })
      .limit(5),
  ])

  const priorityProduct = products?.[0]
  const recommendation = {
    produto: priorityProduct?.name ?? '',
    tema: weekdayPlan.theme,
    acao: weekdayPlan.action,
    canal: weekdayPlan.channel,
    horario: weekdayPlan.time,
    cta: 'Encomendar pelo WhatsApp',
    observacoes: priorityProduct
      ? `Recomendação da Inteligência de Marketing: divulgar ${priorityProduct.name}. Tema do dia: ${weekdayPlan.theme}. Ação: ${weekdayPlan.action}. Canal sugerido: ${weekdayPlan.channel}. Horário sugerido: ${weekdayPlan.time}. Fazer propaganda explicativa: mostrar sabor, diferencial, como pedir e chamada para WhatsApp.`
      : `Recomendação da Inteligência de Marketing: ${weekdayPlan.action}. Canal sugerido: ${weekdayPlan.channel}. Horário sugerido: ${weekdayPlan.time}.`,
  }

  return (
    <SocialTabs
      posts={posts ?? []}
      campaigns={campaigns ?? []}
      templates={templates ?? []}
      recommendation={recommendation}
    />
  )
}

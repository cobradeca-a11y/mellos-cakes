import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? ''
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mellos-cakes.vercel.app'
const APP_TITLE = 'MellosCakes - Gerador de Conteúdo'

const SYSTEM = `Você é especialista em marketing digital para confeitarias artesanais brasileiras.
Cria conteúdo real, direto e humano para vender bolos, tortas e doces.
Priorize sempre o WhatsApp como canal de contato.
Use linguagem simples, comercial e próxima. Sem exageros.
RESPONDA APENAS EM JSON VÁLIDO. Sem markdown, sem texto fora do JSON.`

const MOTORES: Record<string,string> = {
  venda:           'Gere conteúdo DIRETO para VENDER. Desperte desejo e leve à ação imediata.',
  engajamento:     'Gere ENGAJAMENTO: perguntas, enquetes e interação. Não venda diretamente.',
  prova_social:    'Gere PROVA SOCIAL com depoimentos, bastidores e entregas.',
  educativo:       'Gere conteúdo EDUCATIVO explicando sabores, tamanhos, recheios e prazos.',
  promocional:     'Gere conteúdo PROMOCIONAL para desconto, combo ou oferta com urgência.',
  reaproveitamento:'ADAPTE o conteúdo fornecido para outra rede mantendo a essência.',
}

const FORMATOS: Record<string,string> = {
  post:     'Post estático para o feed',
  reels:    'Roteiro de Reels com cenas numeradas (max 60s)',
  story:    'Sequência de 3 a 5 stories com texto e ação em cada tela',
  carrossel:'Carrossel de 4 a 6 slides com título e texto por slide',
  shorts:   'Roteiro de YouTube Shorts com cenas e narração',
  mensagem: 'Mensagem de WhatsApp direta e persuasiva',
}

type RequestPayload = {
  motor?: string
  formato?: string
  canal?: string
  produto?: string
  tipo_produto?: string
  publico?: string
  objetivo?: string
  tom?: string
  cta?: string
  link_whatsapp?: string
  observacoes?: string
  conteudo_original?: string
}

function getFallbackContent({
  motor='venda', formato='post', canal='instagram', produto='', link_whatsapp='', cta,
}: RequestPayload) {
  const isVideo     = formato==='reels' || formato==='shorts'
  const isCarrossel = formato==='carrossel'
  const isStory     = formato==='story'

  return {
    titulo: `${produto} — Conteúdo de ${motor}`,
    texto_principal: `🎂 ${produto} artesanal feito com carinho!\n\nCada camada foi pensada para entregar sabor, cremosidade e aquela vontade de repetir.\n\nFaça sua encomenda pelo WhatsApp ${link_whatsapp ?? ''}`,
    legenda: `Seu ${produto} perfeito está aqui! 🎂✨ Feito com capricho, recheio generoso e sabor de verdade. Faça sua encomenda e garanta o seu!`,
    hashtags: '#melloscakes #bolodepote #confeitariaartesanal #docesartesanais #riograndeRS #feitocomcarinho',
    cta: cta ?? 'Encomendar pelo WhatsApp agora!',
    roteiro: isVideo ? '1. Mostrar o produto finalizado\n2. Aproximar nas camadas e textura\n3. Mostrar uma colherada ou detalhe do recheio\n4. Fechar com chamada para encomenda no WhatsApp' : null,
    slides: isCarrossel ? [
      { titulo: `${produto} chegou!`, texto: 'Camadas cremosas e sabor marcante.' },
      { titulo: 'Feito com capricho', texto: 'Produção artesanal e apresentação impecável.' },
      { titulo: 'Pronto para saborear', texto: 'Ideal para pedir para você ou presentear.' },
      { titulo: 'Peça o seu', texto: link_whatsapp || 'Chame no WhatsApp e faça sua encomenda.' },
    ] : null,
    stories: isStory ? [
      { tela:1, texto:`Hoje tem ${produto}! 🎂`, acao:'Mostrar o produto' },
      { tela:2, texto:'Cremoso, bonito e feito com carinho.', acao:'Mostrar detalhes das camadas' },
      { tela:3, texto:'Quer o seu?', acao:'Chamar no WhatsApp' },
    ] : null,
    melhor_rede: canal === 'youtube' ? 'YouTube Shorts' : canal.charAt(0).toUpperCase() + canal.slice(1),
    melhor_horario: '18h–21h',
    dica: 'Revise o texto antes de publicar e adapte o WhatsApp/valor conforme a campanha do dia.',
  }
}

function getCandidateModels() {
  return [
    OPENROUTER_MODEL,
    'openrouter/auto',
  ].filter(Boolean)
}

async function callOpenRouter(model: string, prompt: string) {
  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': SITE_URL,
      'X-Title': APP_TITLE,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user',   content: prompt },
      ],
    }),
  })
}

function parseModelText(rawText: string) {
  try { return JSON.parse(rawText) }
  catch {
    const match = rawText.match(/\{[\s\S]*\}/)
    try { return match ? JSON.parse(match[0]) : null } catch { return null }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestPayload = await req.json()
    const {
      motor='venda', formato='post', canal='instagram',
      produto, tipo_produto, publico='pessoas que amam bolos artesanais',
      objetivo, tom='comercial e amigável', cta, link_whatsapp,
      observacoes, conteudo_original,
    } = body

    if (!produto?.trim()) {
      return NextResponse.json({ ok:false, erro:'Informe o produto.' }, { status:400 })
    }

    const isVideo     = formato==='reels' || formato==='shorts'
    const isCarrossel = formato==='carrossel'
    const isStory     = formato==='story'

    const prompt = `Motor: ${MOTORES[motor]??MOTORES.venda}
Rede: ${canal} | Formato: ${FORMATOS[formato]??'Post'}
Produto: ${produto} | Tipo: ${tipo_produto??'confeitaria'}
Público: ${publico}
Objetivo: ${objetivo??'gerar vendas'}
Tom: ${tom} | CTA: ${cta??'Encomendar pelo WhatsApp'}
WhatsApp: ${link_whatsapp??''} | Obs: ${observacoes??''}
${conteudo_original?`Original:\n${conteudo_original}`:''}

JSON exato (sem nada fora):
{"titulo":"...","texto_principal":"...","legenda":"...","hashtags":"...","cta":"...","roteiro":${isVideo?'"..."':'null'},"slides":${isCarrossel?'[{"titulo":"","texto":""}]':'null'},"stories":${isStory?'[{"tela":1,"texto":"","acao":""}]':'null'},"melhor_rede":"...","melhor_horario":"...","dica":"..."}`

    if (!OPENROUTER_KEY) {
      return NextResponse.json({
        ok: true,
        conteudo: getFallbackContent(body),
        aviso: 'Conteúdo de demonstração. Configure OPENROUTER_API_KEY na Vercel para geração real com IA.'
      })
    }

    const errors: string[] = []

    for (const model of getCandidateModels()) {
      const response = await callOpenRouter(model, prompt)

      if (!response.ok) {
        const err = await response.text()
        errors.push(`${model}: ${err.slice(0, 220)}`)
        continue
      }

      const data = await response.json()
      const rawText = data.choices?.[0]?.message?.content ?? '{}'
      const parsed = parseModelText(rawText)

      if (parsed) {
        return NextResponse.json({
          ok: true,
          conteudo: parsed,
          modelo_usado: model,
        })
      }

      errors.push(`${model}: resposta da IA não veio em JSON válido`)
    }

    return NextResponse.json({
      ok: true,
      conteudo: getFallbackContent(body),
      aviso: `⚠️ A IA não respondeu com um modelo disponível. Foi gerado um conteúdo temporário. Configure OPENROUTER_MODEL na Vercel com um modelo ativo do OpenRouter. Último erro: ${errors.at(-1) ?? 'modelo indisponível'}`,
    })

  } catch (err: any) {
    return NextResponse.json({ ok:false, erro: err.message }, { status:500 })
  }
}

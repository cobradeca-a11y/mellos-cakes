import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const SYSTEM = `Você é um especialista em marketing digital para confeitarias artesanais.
Gera conteúdo real, comercial e simples para vender bolos, tortas e doces.
Sempre priorize WhatsApp como canal de contato.
Tom direto, humano, sem exageros. Foco em venda real.
Responda APENAS em JSON válido, sem markdown, sem explicações fora do JSON.`

const MOTORES: Record<string, string> = {
  venda: 'Gere conteúdo direto para VENDER o produto. Foco em despertar desejo e levar à ação imediata.',
  engajamento: 'Gere conteúdo para ENGAJAMENTO: perguntas, enquetes, interação. Não venda diretamente.',
  prova_social: 'Gere conteúdo de PROVA SOCIAL usando depoimentos, bastidores e entregas reais.',
  educativo: 'Gere conteúdo EDUCATIVO explicando sabores, tamanhos, recheios, prazos e diferenciais.',
  promocional: 'Gere conteúdo PROMOCIONAL para desconto, combo ou oferta por tempo limitado.',
  reaproveitamento: 'ADAPTE o conteúdo fornecido para outra rede social mantendo a essência.',
}

const FORMATOS: Record<string, string> = {
  post: 'Post estático para feed',
  reels: 'Roteiro de Reels/video curto de ate 60 segundos com narracao e cenas',
  story: 'Sequencia de 3 a 5 stories com texto e acao em cada tela',
  carrossel: 'Carrossel de 4 a 6 slides com titulo e texto por slide',
  shorts: 'Roteiro para YouTube Shorts com cenas e narracao',
  mensagem: 'Mensagem de WhatsApp direta e persuasiva',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { motor='venda', formato='post', canal='instagram', produto, tipo_produto,
      publico='clientes que gostam de bolos artesanais', objetivo, tom='comercial e amigavel',
      cta, link_whatsapp, observacoes, conteudo_original } = body

    const isVideo    = formato === 'reels' || formato === 'shorts'
    const isCarrossel = formato === 'carrossel'
    const isStory    = formato === 'story'

    const userPrompt = `
Motor: ${MOTORES[motor] ?? MOTORES.venda}
Rede social: ${canal}
Formato: ${FORMATOS[formato] ?? 'Post'}
Produto: ${produto ?? 'bolo artesanal'}
Tipo: ${tipo_produto ?? 'confeitaria'}
Publico: ${publico}
Objetivo: ${objetivo ?? 'gerar vendas'}
Tom de voz: ${tom}
CTA: ${cta ?? 'Encomendar pelo WhatsApp'}
WhatsApp/Link: ${link_whatsapp ?? ''}
Observacoes: ${observacoes ?? ''}
${conteudo_original ? `Conteudo original para adaptar:\n${conteudo_original}` : ''}

Retorne EXATAMENTE este JSON (sem nada fora do JSON):
{
  "titulo": "titulo interno",
  "texto_principal": "texto completo",
  "legenda": "legenda da publicacao",
  "hashtags": "#confeitaria #bolo ...",
  "cta": "chamada para acao",
  "roteiro": ${isVideo ? '"roteiro com cenas numeradas: 1. ... 2. ..."' : 'null'},
  "slides": ${isCarrossel ? '[{"titulo":"Slide 1","texto":"texto do slide"}]' : 'null'},
  "stories": ${isStory ? '[{"tela":1,"texto":"texto","acao":"arrastar para cima"}]' : 'null'},
  "melhor_rede": "rede social ideal para este conteudo",
  "melhor_horario": "horario sugerido ex: 19h-21h",
  "dica": "dica rapida de uso"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await response.json()
    const rawText = data.content?.[0]?.text ?? '{}'

    let parsed: any
    try {
      parsed = JSON.parse(rawText)
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/)
      try { parsed = match ? JSON.parse(match[0]) : null } catch { parsed = null }
    }

    if (!parsed) return NextResponse.json({ ok: false, erro: 'Falha ao gerar conteudo.' }, { status: 500 })

    return NextResponse.json({ ok: true, conteudo: parsed })
  } catch (err: any) {
    return NextResponse.json({ ok: false, erro: err.message }, { status: 500 })
  }
}

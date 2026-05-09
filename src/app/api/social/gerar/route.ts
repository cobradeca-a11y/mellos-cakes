import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? ''
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mellos-cakes.vercel.app'
const APP_TITLE = 'MellosCakes - Gerador de Conteúdo'

const PADRAO_VISUAL_BOLO_POTE = `Padrão visual obrigatório para bolo de pote da Mello's Cakes:
- Sempre priorizar foto real do produto quando existir.
- Se sugerir imagem de IA, o pote precisa seguir o modelo canônico da marca.
- Pote quadrado transparente de 220 ml com tampa lacre transparente.
- Proporção do pote: lados de 6,5 cm e altura de 7,6 cm.
- Corpo alto, cantos arredondados, plástico transparente e tampa quadrada encaixada com lacre/trava lateral.
- A imagem deve preservar o formato quadrado do pote, a transparência, a tampa lacre e a proporção real.
- Recheio e massa podem mudar conforme o sabor, mas o pote não muda.
- Evitar copo redondo, pote cilíndrico, taça, bowl, vidro, embalagem sem tampa ou pote sem lacre.
- Para Ninho com Nutella: massa de baunilha clara, recheio de Ninho, camadas finas de Nutella e zig-zag de Nutella no topo quando aplicável.
`

const SYSTEM = `Você é especialista sênior em marketing digital para confeitarias artesanais brasileiras.
Cria conteúdo real, direto, humano e profissional para vender bolos de pote, bolos, tortas e doces.
Priorize WhatsApp como canal de conversão, mas entregue também direção criativa para imagem/vídeo.
Nunca invente informação que o usuário não forneceu: preço, desconto, endereço, estoque, prazo ou sabor não informado.
Use linguagem simples, comercial e próxima, sem exageros vazios.
HASHTAGS: sempre comece cada hashtag com #, separe por espaço e nunca junte palavras sem #.
PROPAGANDA: quando indicar propaganda, explique claramente o que fazer, por que fazer, qual produto destacar, qual argumento usar, qual canal usar, qual horário usar e qual ação o cliente deve tomar.
CTA significa chamada para ação: uma frase objetiva dizendo o próximo passo do cliente, por exemplo: pedir pelo WhatsApp, responder a enquete, reservar o sabor, chamar para encomendar.
IMAGENS: sempre recomende foto real quando houver. Se indicar imagem gerada por IA para bolo de pote, preserve obrigatoriamente o pote quadrado transparente com tampa lacre da Mello's Cakes.
RESPONDA APENAS EM JSON VÁLIDO. Sem markdown, sem texto fora do JSON.`

const MOTORES: Record<string,string> = {
  venda:           'Gere conteúdo DIRETO para VENDER. Desperte desejo, destaque diferenciais e leve à ação imediata.',
  engajamento:     'Gere ENGAJAMENTO com perguntas, enquetes, caixa de perguntas e interação. Venda de forma indireta.',
  prova_social:    'Gere PROVA SOCIAL com depoimentos, bastidores, preparação e confiança.',
  educativo:       'Gere conteúdo EDUCATIVO explicando sabores, tamanhos, recheios, conservação, validade e prazos quando informados.',
  promocional:     'Gere conteúdo PROMOCIONAL para combo, desconto ou oferta. Use urgência apenas se houver base nas observações.',
  reaproveitamento:'ADAPTE o conteúdo fornecido para outra rede mantendo a essência e ajustando formato, CTA e linguagem.',
}

const FORMATOS: Record<string,string> = {
  post:     'Post estático para o feed',
  reels:    'Roteiro de Reels com cenas numeradas, gancho inicial e CTA final (max 60s)',
  story:    'Sequência de 3 a 5 stories com texto, interação e ação em cada tela',
  carrossel:'Carrossel de 4 a 6 slides com título, texto e intenção de cada slide',
  shorts:   'Roteiro de YouTube Shorts com cenas, narração e CTA',
  mensagem: 'Mensagem de WhatsApp direta e persuasiva',
}

const INTELIGENCIA_MARKETING_BASE = `Base da Inteligência de Marketing da Mello's Cakes:
- O objetivo é transformar dados de produtos, pedidos, campanhas e calendário comercial em orientação prática de venda.
- Toda propaganda deve ser explicativa: apresentar o produto, mostrar o diferencial, indicar para quem serve, explicar como pedir e finalizar com chamada para ação.
- Priorizar produto disponível, produto em destaque, produto com maior apelo visual ou produto adequado à data comercial.
- Segunda: cardápio, bastidor e planejamento da semana.
- Terça: explicar sabores, camadas, conservação e diferenciais.
- Quarta: prova social, bastidor, feedback e confiança.
- Quinta: antecipar pedidos de sexta e sábado.
- Sexta: venda direta explicativa, desejo visual e WhatsApp.
- Sábado: consumo imediato, disponibilidade e reforço visual.
- Domingo: família, sobremesa, afeto e encomendas da semana.
- Para lançamento ou sabor novo: usar prévia, enquete, contagem regressiva, anúncio oficial e chamada para reserva.
- Para datas comemorativas: iniciar campanha antes da data, alternando bastidor, desejo visual, prova social, explicação do produto e venda direta.
- Não usar falsa escassez. Só falar últimas unidades, desconto ou prazo se o usuário informar.
`

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

function normalizeHashtags(value: unknown) {
  if (!value) return '#melloscakes #bolodepote #confeitariaartesanal #docesartesanais #feitoComCarinho'

  if (Array.isArray(value)) {
    return value
      .map(tag => String(tag).trim())
      .filter(Boolean)
      .map(tag => tag.startsWith('#') ? tag : `#${tag.replace(/^#+/, '')}`)
      .join(' ')
  }

  const raw = String(value).trim()
  const tokens = raw
    .replace(/,/g, ' ')
    .split(/\s+/)
    .map(tag => tag.trim())
    .filter(Boolean)

  if (tokens.length > 1) {
    return tokens.map(tag => tag.startsWith('#') ? tag : `#${tag.replace(/^#+/, '')}`).join(' ')
  }

  if (raw.includes('#')) {
    return raw
      .split('#')
      .map(tag => tag.trim())
      .filter(Boolean)
      .map(tag => `#${tag.replace(/\s+/g, '')}`)
      .join(' ')
  }

  return raw.startsWith('#') ? raw : `#${raw}`
}

function textValue(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    return value
      .map(item => textValue(item))
      .filter(Boolean)
      .join('\n')
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => `${key.replaceAll('_', ' ')}: ${textValue(val)}`)
      .filter(line => !line.endsWith(': '))
      .join('\n')
  }
  return fallback
}

function getDefaultPromptImagem(produto: string, canal: string) {
  return `Preferir foto real do produto. Se for gerar imagem com IA: foto profissional e apetitosa de ${produto} dentro do pote quadrado transparente da Mello's Cakes, pote de 220 ml com lados de 6,5 cm e altura de 7,6 cm, corpo alto com cantos arredondados, tampa lacre transparente quadrada encaixada com trava lateral, camadas visíveis de massa e recheio conforme o sabor, embalagem limpa, iluminação natural suave, fundo de confeitaria artesanal, foco nas camadas e textura cremosa, composição vertical para ${canal}, sem textos na imagem, sem copo redondo, sem pote cilíndrico, sem embalagem diferente.`
}

function enhanceContent(content: any, body: RequestPayload) {
  const canal = body.canal ?? 'instagram'
  const produto = body.produto ?? 'produto'
  const formato = body.formato ?? 'post'
  const isLaunch = /lançamento|novo sabor|sabor novo|novidade|estreia/i.test(`${body.observacoes ?? ''} ${produto}`)

  return {
    titulo: textValue(content?.titulo, `${produto} — Conteúdo profissional`),
    texto_principal: textValue(content?.texto_principal, `🎂 ${produto} feito com capricho para deixar seu dia mais gostoso.`),
    legenda: textValue(content?.legenda, `Seu ${produto} está esperando por você. Faça sua encomenda pelo WhatsApp!`),
    hashtags: normalizeHashtags(content?.hashtags),
    cta: textValue(content?.cta, body.cta ?? 'Pedir pelo WhatsApp agora'),
    roteiro: content?.roteiro ? textValue(content.roteiro) : null,
    slides: content?.slides ?? null,
    stories: content?.stories ?? null,
    melhor_rede: textValue(content?.melhor_rede, canal === 'youtube' ? 'YouTube Shorts' : canal.charAt(0).toUpperCase() + canal.slice(1)),
    melhor_horario: textValue(content?.melhor_horario, '18h–21h'),
    dica: textValue(content?.dica, 'Use foto real do produto quando houver. Se usar imagem de IA, mantenha o pote quadrado transparente com tampa lacre da Mello\'s Cakes.'),
    orientacao_propaganda: textValue(content?.orientacao_propaganda, `Divulgue ${produto} explicando sabor, textura, diferencial do pote e como pedir pelo WhatsApp.`),
    prompt_imagem: textValue(content?.prompt_imagem, getDefaultPromptImagem(produto, canal)),
    texto_na_arte: textValue(content?.texto_na_arte, `Hoje tem ${produto}`),
    fundo_visual: textValue(content?.fundo_visual, 'Fundo claro, limpo e artesanal, com tons quentes, boa iluminação e destaque total para o produto no pote quadrado transparente com tampa lacre.'),
    interacoes: content?.interacoes ?? {
      enquete: `Você provaria ${produto} hoje?`,
      opcoes: ['Sim, eu quero!', 'Quero ver sabores'],
      caixa_pergunta: 'Qual sabor você quer ver por aqui?',
      contagem_regressiva: isLaunch ? `Lançamento de ${produto}` : null,
    },
    checklist_publicacao: content?.checklist_publicacao ?? [
      'Usar foto real e nítida do produto quando houver',
      'Se usar imagem de IA, conferir se o pote é quadrado transparente com tampa lacre',
      'Conferir WhatsApp/CTA antes de publicar',
      'Postar no horário sugerido',
      formato === 'story' ? 'Adicionar enquete ou caixa de pergunta' : 'Responder comentários e directs rapidamente',
    ],
  }
}

function getFallbackContent(body: RequestPayload) {
  const {
    motor='venda', formato='post', canal='instagram', produto='', link_whatsapp='', cta,
  } = body
  const isVideo     = formato==='reels' || formato==='shorts'
  const isCarrossel = formato==='carrossel'
  const isStory     = formato==='story'
  const isLaunch = /lançamento|novo sabor|sabor novo|novidade|estreia/i.test(`${body.observacoes ?? ''} ${produto}`)

  return enhanceContent({
    titulo: `${produto} — Conteúdo de ${motor}`,
    texto_principal: `🎂 ${produto} artesanal feito com carinho!\n\nCada camada foi pensada para entregar sabor, cremosidade e aquela vontade de repetir.\n\nFaça sua encomenda pelo WhatsApp ${link_whatsapp ?? ''}`,
    legenda: `Seu ${produto} perfeito está aqui! 🎂✨ Feito com capricho, recheio generoso e sabor de verdade. Faça sua encomenda e garanta o seu!`,
    hashtags: '#melloscakes #bolodepote #confeitariaartesanal #docesartesanais #riograndeRS #feitoComCarinho',
    cta: cta ?? 'Encomendar pelo WhatsApp agora!',
    roteiro: isVideo ? '1. Mostrar o produto real finalizado\n2. Aproximar nas camadas e textura\n3. Mostrar a tampa lacre e o pote quadrado transparente\n4. Mostrar uma colherada ou detalhe do recheio\n5. Fechar com chamada para encomenda no WhatsApp' : null,
    slides: isCarrossel ? [
      { titulo: `${produto} chegou!`, texto: 'Camadas cremosas e sabor marcante.' },
      { titulo: 'Pote com tampa lacre', texto: 'Mais segurança, higiene e praticidade.' },
      { titulo: 'Feito com capricho', texto: 'Produção artesanal e apresentação impecável.' },
      { titulo: 'Peça o seu', texto: link_whatsapp || 'Chame no WhatsApp e faça sua encomenda.' },
    ] : null,
    stories: isStory ? [
      { tela:1, texto:`Hoje tem ${produto}! 🎂`, acao:'Mostrar o produto real no pote quadrado com tampa lacre' },
      { tela:2, texto:'Cremoso, bonito e feito com carinho.', acao:'Adicionar enquete: qual camada você provaria primeiro?' },
      { tela:3, texto:'Encomende pelo WhatsApp!', acao:'Usar sticker de link ou botão de mensagem' },
    ] : null,
    melhor_rede: canal === 'youtube' ? 'YouTube Shorts' : canal.charAt(0).toUpperCase() + canal.slice(1),
    melhor_horario: '18h–21h',
    dica: 'Use foto real do produto quando houver. Se usar imagem de IA, mantenha o pote quadrado transparente com tampa lacre da Mello\'s Cakes.',
    orientacao_propaganda: `Propaganda recomendada: mostre ${produto} no pote quadrado transparente com tampa lacre, explique o sabor e as camadas, destaque que é artesanal e finalize com pedido pelo WhatsApp.`,
    prompt_imagem: getDefaultPromptImagem(produto, canal),
    texto_na_arte: isLaunch ? `Novo sabor: ${produto}` : `Hoje tem ${produto}`,
    fundo_visual: 'Fundo claro, limpo e artesanal, com tons quentes, boa iluminação e destaque total para o produto no pote quadrado transparente com tampa lacre.',
    interacoes: {
      enquete: `Você provaria ${produto} hoje?`,
      opcoes: ['Sim, eu quero!', 'Quero ver sabores'],
      caixa_pergunta: 'Qual sabor você quer ver por aqui?',
      contagem_regressiva: isLaunch ? `Lançamento de ${produto}` : null,
    },
  }, body)
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
      max_tokens: 2200,
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

    const jsonShape = {
      titulo: '...',
      texto_principal: '...',
      legenda: '...',
      hashtags: '#tag1 #tag2 #tag3',
      cta: '...',
      roteiro: isVideo ? '...' : null,
      slides: isCarrossel ? [{ titulo: '', texto: '', intencao: '' }] : null,
      stories: isStory ? [{ tela: 1, texto: '', acao: '', sticker: '' }] : null,
      melhor_rede: '...',
      melhor_horario: '...',
      dica: '...',
      orientacao_propaganda: '...',
      prompt_imagem: '...',
      texto_na_arte: '...',
      fundo_visual: 'descreva em texto corrido; não retorne objeto',
      interacoes: {
        enquete: '...',
        opcoes: ['...', '...'],
        caixa_pergunta: '...',
        contagem_regressiva: null,
      },
      checklist_publicacao: ['...', '...', '...'],
    }

    const prompt = `${INTELIGENCIA_MARKETING_BASE}

${PADRAO_VISUAL_BOLO_POTE}

Motor estratégico: ${MOTORES[motor]??MOTORES.venda}
Rede: ${canal} | Formato: ${FORMATOS[formato]??'Post'}
Produto: ${produto} | Tipo: ${tipo_produto??'confeitaria'}
Público: ${publico}
Objetivo: ${objetivo??'gerar vendas'}
Tom: ${tom} | CTA/chamada para ação desejada: ${cta??'Encomendar pelo WhatsApp'}
WhatsApp: ${link_whatsapp??''} | Observações: ${observacoes??''}
${conteudo_original?`Conteúdo original para reaproveitar:\n${conteudo_original}`:''}

Crie uma geração PROFISSIONAL completa para publicação.
Inclua:
1. Texto principal persuasivo, humano e direto.
2. Legenda pronta para publicar.
3. Hashtags obrigatoriamente separadas por espaço, cada uma começando com #.
4. CTA claro para WhatsApp. Explique o próximo passo do cliente.
5. Melhor horário para postar, com justificativa curta.
6. Orientação de propaganda bem explicativa: o que destacar, por que destacar, canal, horário e ação esperada.
7. Prompt visual para foto real ou imagem de IA. Sempre priorize foto real. Se for IA, o prompt deve exigir o pote quadrado transparente com tampa lacre, proporção 6,5 cm x 7,6 cm, corpo alto, cantos arredondados e tampa quadrada encaixada com lacre/trava lateral.
8. Texto curto para colocar dentro da arte, se fizer sentido.
9. Direção de fundo visual em texto corrido: cores, iluminação, composição e destaque do produto. Não retorne fundo_visual como objeto.
10. Interações: enquete, opções de resposta, caixa de pergunta e contagem regressiva apenas se for lançamento/sabor novo.
11. Checklist de publicação, incluindo conferir se a foto/imagem mantém o pote correto.

JSON exato (sem nada fora):
${JSON.stringify(jsonShape)}

Nunca retorne hashtags juntas como uma palavra única. Nunca omita o #. Nunca sugira pote redondo, copo, taça, bowl ou embalagem diferente para bolo de pote.`

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
          conteudo: enhanceContent(parsed, body),
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

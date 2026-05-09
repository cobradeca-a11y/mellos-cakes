import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? ''
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mellos-cakes.vercel.app'
const APP_TITLE = 'MellosCakes - Gerador de Conteúdo'

type FlavorAssemblyProfile = {
  productName: string
  aliases: string[]
  cakeMass: string
  layers: string[]
  finish: string
  visualStyle: string
}

const PADRAO_VISUAL_BOLO_POTE = `Padrão visual obrigatório para bolo de pote da Mello's Cakes:
- Sempre priorizar foto real do produto quando existir.
- Se sugerir imagem de IA, o pote precisa seguir o modelo canônico da marca.
- Pote quadrado transparente de 220 ml com tampa lacre transparente.
- Proporção do pote: lados de 6,5 cm e altura de 7,6 cm.
- Corpo alto, cantos arredondados, plástico transparente e tampa quadrada encaixada com lacre/trava lateral.
- A imagem deve preservar o formato quadrado do pote, a transparência, a tampa lacre e a proporção real.
- A logo oficial Mello's Cakes deve aparecer como tag circular aplicada na lateral mais visível do pote, centralizada e proporcional.
- A tag deve ter aparência circular, sem fundo branco quadrado, integrada ao pote.
- Recheio e massa podem mudar conforme o sabor, mas o pote não muda.
- O bolo de pote deve ter exatamente duas camadas de massa.
- Não misturar massa branca e massa preta no mesmo pote, salvo decisão explícita futura.
- A montagem visual deve seguir: recheio base → massa → recheio meio → massa → recheio topo → finalização → tampa.
- A imagem deve parecer artesanal, realista, limpa e vendável, com interior levemente desconstruído, camadas naturais, textura cremosa, massa aerada e pequenas irregularidades humanas.
- Evitar copo redondo, pote cilíndrico, taça, bowl, vidro, embalagem sem tampa ou pote sem lacre.
`

const FLAVOR_ASSEMBLY_PROFILES: FlavorAssemblyProfile[] = [
  {
    productName: 'Bolo de Pote de Ninho com Nutella',
    aliases: ['ninho com nutella', 'bolo de pote de ninho com nutella'],
    cakeMass: 'Baunilha branca',
    layers: [
      'recheio de Ninho no fundo',
      'camada fina de Nutella',
      'massa de baunilha branca leve e aerada',
      'recheio de Ninho',
      'camada fina de Nutella',
      'segunda camada de massa de baunilha branca leve e aerada',
      'recheio de Ninho no topo',
      'zig-zag de Nutella por cima',
      'tampa transparente com lacre',
    ],
    finish: 'zig-zag de Nutella',
    visualStyle: 'foto realista, artesanal, limpa e vendável; camadas visíveis, recheio de Ninho cremoso, Nutella em faixas finas e marcantes, massa de baunilha clara com textura aerada; interior levemente desconstruído, com pequenas irregularidades naturais para parecer feito à mão',
  },
  {
    productName: 'Bolo de Pote de Pistache com Geleia de Frutas Vermelhas',
    aliases: [
      'pistache com frutas vermelhas',
      'pistache com geleia de frutas vermelhas',
      'bolo de pote de pistache com frutas vermelhas',
      'bolo de pote de pistache com geleia de frutas vermelhas',
    ],
    cakeMass: 'Baunilha branca',
    layers: [
      'recheio de pistache no fundo',
      'massa de baunilha branca leve e aerada',
      'recheio de pistache no meio',
      'geleia de frutas vermelhas em faixa ou veios visíveis sobre o recheio do meio',
      'segunda camada de massa de baunilha branca leve e aerada',
      'recheio de pistache no topo',
      'geleia de frutas vermelhas no centro ou em veios artesanais por cima',
      'finalização com xerém de pistache',
      'tampa transparente com lacre',
    ],
    finish: 'geleia de frutas vermelhas e xerém de pistache',
    visualStyle: 'foto realista, artesanal, limpa e vendável; creme de pistache em tom verde suave, geleia de frutas vermelhas intensa, massa de baunilha clara e aerada; interior levemente desconstruído, textura cremosa e feita à mão',
  },
  {
    productName: 'Bolo de Pote de Chocolate com Maracujá',
    aliases: [
      'chocolate com maracuja',
      'chocolate com maracujá',
      'bolo de pote de chocolate com maracuja',
      'bolo de pote de chocolate com maracujá',
    ],
    cakeMass: 'Chocolate Black',
    layers: [
      'brigadeiro de chocolate blend no fundo',
      'massa Chocolate Black',
      'brigadeiro de maracujá no meio',
      'segunda camada de massa Chocolate Black',
      'topo com brigadeiro de maracujá e brigadeiro de chocolate blend',
      'finalização com granulé de chocolate ao leite ou detalhe de chocolate',
      'tampa transparente com lacre',
    ],
    finish: 'granulé de chocolate ao leite ou detalhe de chocolate',
    visualStyle: 'foto realista, artesanal, limpa e vendável; contraste entre massa escura de chocolate, recheio amarelo de maracujá e chocolate cremoso; interior levemente desconstruído, camadas naturais, massa úmida e recheios cremosos',
  },
  {
    productName: 'Bolo de Pote de Chocolate com Ninho',
    aliases: [
      'chocolate com ninho',
      'choconinho',
      'bolo de pote de chocolate com ninho',
      'bolo de pote choconinho',
    ],
    cakeMass: 'Chocolate Black',
    layers: [
      'brigadeiro de chocolate blend no fundo',
      'massa Chocolate Black',
      'brigadeiro de Ninho no meio',
      'segunda camada de massa Chocolate Black',
      'topo com brigadeiro de Ninho e brigadeiro de chocolate blend',
      'finalização com leite em pó e/ou granulé de chocolate ao leite',
      'tampa transparente com lacre',
    ],
    finish: 'leite em pó e/ou granulé de chocolate ao leite',
    visualStyle: 'foto realista, artesanal, limpa e vendável; contraste forte entre massa preta de chocolate, creme branco de Ninho e chocolate blend; camadas visíveis, interior levemente desconstruído, massa úmida e recheios cremosos',
  },
  {
    productName: 'Bolo de Pote de Ninho com Geleia de Morango',
    aliases: [
      'ninho com geleia',
      'ninho com geleia de morango',
      'bolo de pote de ninho com geleia',
      'bolo de pote de ninho com geleia de morango',
    ],
    cakeMass: 'Baunilha branca',
    layers: [
      'brigadeiro de Ninho no fundo',
      'massa de baunilha branca leve e aerada',
      'brigadeiro de Ninho no meio',
      'geleia de morango em faixa ou veios visíveis sobre o recheio do meio',
      'segunda camada de massa de baunilha branca leve e aerada',
      'topo com brigadeiro de Ninho',
      'geleia de morango no centro ou em veios artesanais',
      'finalização com leite em pó',
      'tampa transparente com lacre',
    ],
    finish: 'geleia de morango e leite em pó',
    visualStyle: 'foto realista, artesanal, limpa e vendável; creme branco de Ninho, massa clara de baunilha e geleia vermelha de morango em contraste; interior levemente desconstruído, com textura cremosa, massa aerada e aparência feita à mão',
  },
  {
    productName: 'Bolo de Pote Matilda',
    aliases: ['matilda', 'bolo de pote matilda', 'bolo de pote de matilda'],
    cakeMass: 'Chocolate Black',
    layers: [
      'brigadeiro de chocolate blend no fundo',
      'massa Chocolate Black',
      'brigadeiro de chocolate blend no meio',
      'segunda camada de massa Chocolate Black',
      'topo com brigadeiro de chocolate blend',
      'finalização com granulé de chocolate ao leite',
      'tampa transparente com lacre',
    ],
    finish: 'granulé de chocolate ao leite',
    visualStyle: 'foto realista, artesanal, limpa e vendável; visual de chocolate intenso, camadas escuras e cremosas, massa Chocolate Black úmida, brigadeiro de chocolate blend abundante e acabamento com granulé de chocolate ao leite; interior levemente desconstruído, apetitoso e feito à mão',
  },
]

const SYSTEM = `Você é especialista sênior em marketing digital para confeitarias artesanais brasileiras.
Cria conteúdo real, direto, humano e profissional para vender bolos de pote, bolos, tortas e doces.
Priorize WhatsApp como canal de conversão, mas entregue também direção criativa para imagem/vídeo.
Nunca invente informação que o usuário não forneceu: preço, desconto, endereço, estoque, prazo ou sabor não informado.
Use linguagem simples, comercial e próxima, sem exageros vazios.
HASHTAGS: sempre comece cada hashtag com #, separe por espaço e nunca junte palavras sem #.
PROPAGANDA: quando indicar propaganda, explique claramente o que fazer, por que fazer, qual produto destacar, qual argumento usar, qual canal usar, qual horário usar e qual ação o cliente deve tomar.
CTA significa chamada para ação: uma frase objetiva dizendo o próximo passo do cliente, por exemplo: pedir pelo WhatsApp, responder a enquete, reservar o sabor, chamar para encomendar.
IMAGENS: sempre recomende foto real quando houver. Se indicar imagem gerada por IA para bolo de pote, preserve obrigatoriamente o pote quadrado transparente com tampa lacre da Mello's Cakes, a logo oficial como tag circular na lateral e a montagem de camadas do sabor.
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

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getFlavorProfile(produto = '') {
  const normalizedProduct = normalizeText(produto)

  return FLAVOR_ASSEMBLY_PROFILES.find(profile =>
    profile.aliases.some(alias => {
      const normalizedAlias = normalizeText(alias)
      return normalizedProduct === normalizedAlias || normalizedProduct.includes(normalizedAlias)
    })
  )
}

function getFlavorAssemblyPrompt(produto = '') {
  const profile = getFlavorProfile(produto)

  if (!profile) {
    return `Perfil de montagem do sabor:
- Sabor informado: ${produto || 'não informado'}.
- Se não houver perfil específico cadastrado para o sabor, manter o padrão visual obrigatório e montar conforme os recheios/massas informados no cadastro ou nas observações.
- Nunca inventar recheio, massa, acabamento, estoque, preço ou disponibilidade.`
  }

  return `Perfil de montagem cadastrado para o sabor:
- Produto reconhecido: ${profile.productName}.
- Massa: ${profile.cakeMass}.
- Montagem do fundo para o topo:
${profile.layers.map((layer, index) => `${index + 1}. ${layer};`).join('\n')}
- Finalização: ${profile.finish}.
- Aparência desejada: ${profile.visualStyle}.
- Ao gerar prompt visual ou imagem, usar esse perfil automaticamente mesmo se o usuário digitar apenas o nome do sabor.`
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
  const profile = getFlavorProfile(produto)
  const flavorDetails = profile
    ? ` Montagem específica do sabor ${profile.productName}: ${profile.layers.join(' → ')}. Massa: ${profile.cakeMass}. Finalização: ${profile.finish}. Aparência: ${profile.visualStyle}.`
    : ' Camadas visíveis de massa e recheio conforme o sabor informado, sem inventar ingredientes não cadastrados.'

  return `Preferir foto real do produto. Se for gerar imagem com IA: foto profissional e apetitosa de ${profile?.productName ?? produto} dentro do pote quadrado transparente da Mello's Cakes, pote de 220 ml com lados de 6,5 cm e altura de 7,6 cm, corpo alto com cantos arredondados, tampa lacre transparente quadrada encaixada com trava lateral, logo oficial Mello's Cakes como tag circular centralizada na lateral mais visível, embalagem limpa, iluminação natural suave, fundo de confeitaria artesanal, foco nas camadas e textura cremosa, composição vertical para ${canal}, sem textos na imagem, sem copo redondo, sem pote cilíndrico, sem taça, sem bowl, sem vidro, sem embalagem diferente.${flavorDetails}`
}

function enforceVisualPrompt(produto: string, canal: string, value: unknown) {
  const generatedPrompt = textValue(value, '')
  const requiredPrompt = getDefaultPromptImagem(produto, canal)

  if (!generatedPrompt) return requiredPrompt

  return `${generatedPrompt}\n\nObrigatório manter: ${requiredPrompt}`
}

function enhanceContent(content: any, body: RequestPayload) {
  const canal = body.canal ?? 'instagram'
  const produto = body.produto ?? 'produto'
  const formato = body.formato ?? 'post'
  const profile = getFlavorProfile(produto)
  const displayProduct = profile?.productName ?? produto
  const isLaunch = /lançamento|novo sabor|sabor novo|novidade|estreia/i.test(`${body.observacoes ?? ''} ${produto}`)

  return {
    titulo: textValue(content?.titulo, `${displayProduct} — Conteúdo profissional`),
    texto_principal: textValue(content?.texto_principal, `🎂 ${displayProduct} feito com capricho para deixar seu dia mais gostoso.`),
    legenda: textValue(content?.legenda, `Seu ${displayProduct} está esperando por você. Faça sua encomenda pelo WhatsApp!`),
    hashtags: normalizeHashtags(content?.hashtags),
    cta: textValue(content?.cta, body.cta ?? 'Pedir pelo WhatsApp agora'),
    roteiro: content?.roteiro ? textValue(content.roteiro) : null,
    slides: content?.slides ?? null,
    stories: content?.stories ?? null,
    melhor_rede: textValue(content?.melhor_rede, canal === 'youtube' ? 'YouTube Shorts' : canal.charAt(0).toUpperCase() + canal.slice(1)),
    melhor_horario: textValue(content?.melhor_horario, '18h–21h'),
    dica: textValue(content?.dica, 'Use foto real do produto quando houver. Se usar imagem de IA, mantenha o pote quadrado transparente com tampa lacre da Mello\'s Cakes, a logo na lateral e a montagem correta do sabor.'),
    orientacao_propaganda: textValue(content?.orientacao_propaganda, `Divulgue ${displayProduct} explicando sabor, textura, diferencial do pote e como pedir pelo WhatsApp.`),
    prompt_imagem: enforceVisualPrompt(displayProduct, canal, content?.prompt_imagem),
    texto_na_arte: textValue(content?.texto_na_arte, `Hoje tem ${displayProduct}`),
    fundo_visual: textValue(content?.fundo_visual, 'Fundo claro, limpo e artesanal, com tons quentes, boa iluminação e destaque total para o produto no pote quadrado transparente com tampa lacre.'),
    interacoes: content?.interacoes ?? {
      enquete: `Você provaria ${displayProduct} hoje?`,
      opcoes: ['Sim, eu quero!', 'Quero ver sabores'],
      caixa_pergunta: 'Qual sabor você quer ver por aqui?',
      contagem_regressiva: isLaunch ? `Lançamento de ${displayProduct}` : null,
    },
    checklist_publicacao: content?.checklist_publicacao ?? [
      'Usar foto real e nítida do produto quando houver',
      'Se usar imagem de IA, conferir se o pote é quadrado transparente com tampa lacre',
      'Conferir se a logo oficial está como tag circular na lateral visível',
      'Conferir se as camadas seguem a montagem cadastrada do sabor',
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
  const profile = getFlavorProfile(produto)
  const displayProduct = profile?.productName ?? produto
  const isVideo     = formato==='reels' || formato==='shorts'
  const isCarrossel = formato==='carrossel'
  const isStory     = formato==='story'
  const isLaunch = /lançamento|novo sabor|sabor novo|novidade|estreia/i.test(`${body.observacoes ?? ''} ${produto}`)

  return enhanceContent({
    titulo: `${displayProduct} — Conteúdo de ${motor}`,
    texto_principal: `🎂 ${displayProduct} artesanal feito com carinho!\n\nCada camada foi pensada para entregar sabor, cremosidade e aquela vontade de repetir.\n\nFaça sua encomenda pelo WhatsApp ${link_whatsapp ?? ''}`,
    legenda: `Seu ${displayProduct} perfeito está aqui! 🎂✨ Feito com capricho, recheio generoso e sabor de verdade. Faça sua encomenda e garanta o seu!`,
    hashtags: '#melloscakes #bolodepote #confeitariaartesanal #docesartesanais #riograndeRS #feitoComCarinho',
    cta: cta ?? 'Encomendar pelo WhatsApp agora!',
    roteiro: isVideo ? '1. Mostrar o produto real finalizado\n2. Aproximar nas camadas e textura\n3. Mostrar a tampa lacre e o pote quadrado transparente\n4. Mostrar a logo oficial na lateral\n5. Mostrar uma colherada ou detalhe do recheio\n6. Fechar com chamada para encomenda no WhatsApp' : null,
    slides: isCarrossel ? [
      { titulo: `${displayProduct} chegou!`, texto: 'Camadas cremosas e sabor marcante.' },
      { titulo: 'Pote com tampa lacre', texto: 'Mais segurança, higiene e praticidade.' },
      { titulo: 'Feito com capricho', texto: 'Produção artesanal e apresentação impecável.' },
      { titulo: 'Peça o seu', texto: link_whatsapp || 'Chame no WhatsApp e faça sua encomenda.' },
    ] : null,
    stories: isStory ? [
      { tela:1, texto:`Hoje tem ${displayProduct}! 🎂`, acao:'Mostrar o produto real no pote quadrado com tampa lacre' },
      { tela:2, texto:'Cremoso, bonito e feito com carinho.', acao:'Adicionar enquete: qual camada você provaria primeiro?' },
      { tela:3, texto:'Encomende pelo WhatsApp!', acao:'Usar sticker de link ou botão de mensagem' },
    ] : null,
    melhor_rede: canal === 'youtube' ? 'YouTube Shorts' : canal.charAt(0).toUpperCase() + canal.slice(1),
    melhor_horario: '18h–21h',
    dica: 'Use foto real do produto quando houver. Se usar imagem de IA, mantenha o pote quadrado transparente com tampa lacre da Mello\'s Cakes.',
    orientacao_propaganda: `Propaganda recomendada: mostre ${displayProduct} no pote quadrado transparente com tampa lacre, explique o sabor e as camadas, destaque que é artesanal e finalize com pedido pelo WhatsApp.`,
    prompt_imagem: getDefaultPromptImagem(displayProduct, canal),
    texto_na_arte: isLaunch ? `Novo sabor: ${displayProduct}` : `Hoje tem ${displayProduct}`,
    fundo_visual: 'Fundo claro, limpo e artesanal, com tons quentes, boa iluminação e destaque total para o produto no pote quadrado transparente com tampa lacre.',
    interacoes: {
      enquete: `Você provaria ${displayProduct} hoje?`,
      opcoes: ['Sim, eu quero!', 'Quero ver sabores'],
      caixa_pergunta: 'Qual sabor você quer ver por aqui?',
      contagem_regressiva: isLaunch ? `Lançamento de ${displayProduct}` : null,
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
    const profile = getFlavorProfile(produto)
    const displayProduct = profile?.productName ?? produto

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

${getFlavorAssemblyPrompt(produto)}

Motor estratégico: ${MOTORES[motor]??MOTORES.venda}
Rede: ${canal} | Formato: ${FORMATOS[formato]??'Post'}
Produto solicitado: ${produto} | Produto reconhecido: ${displayProduct} | Tipo: ${tipo_produto??'confeitaria'}
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
7. Prompt visual para foto real ou imagem de IA. Sempre priorize foto real. Se for IA, o prompt deve exigir o pote quadrado transparente com tampa lacre, proporção 6,5 cm x 7,6 cm, corpo alto, cantos arredondados, tampa quadrada encaixada com lacre/trava lateral, logo oficial como tag circular na lateral e montagem correta do sabor.
8. Texto curto para colocar dentro da arte, se fizer sentido.
9. Direção de fundo visual em texto corrido: cores, iluminação, composição e destaque do produto. Não retorne fundo_visual como objeto.
10. Interações: enquete, opções de resposta, caixa de pergunta e contagem regressiva apenas se for lançamento/sabor novo.
11. Checklist de publicação, incluindo conferir se a foto/imagem mantém o pote correto, a logo e as camadas cadastradas.

JSON exato (sem nada fora):
${JSON.stringify(jsonShape)}

Nunca retorne hashtags juntas como uma palavra única. Nunca omita o #. Nunca sugira pote redondo, copo, taça, bowl, vidro ou embalagem diferente para bolo de pote. Nunca mude a montagem cadastrada de um sabor reconhecido.`

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

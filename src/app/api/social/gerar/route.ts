import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? ''

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
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
        conteudo: {
          titulo: `${produto} — Conteúdo de ${motor}`,
          texto_principal: `🎂 ${produto} artesanal feito com amor!\n\nCada detalhe pensado pra você. Encomende já e garanta o seu!\n\nEntre em contato pelo WhatsApp ${link_whatsapp??''}`,
          legenda: `Seu ${produto} perfeito está aqui! 🎂✨ Feito com os melhores ingredientes, personalizado do seu jeito. Faça já sua encomenda!`,
          hashtags: '#confeitaria #boloartesanal #bolopersonalizado #bolodelicioso #confeitariaartesanal #feitocomamor',
          cta: cta ?? 'Encomendar pelo WhatsApp agora!',
          roteiro: isVideo ? '1. Mostrar o bolo finalizado\n2. Cortar uma fatia\n3. Mostrar o recheio\n4. Chamar para o WhatsApp' : null,
          slides: isCarrossel ? [
            { titulo: `${produto} chegou!`, texto: 'Feito com ingredientes selecionados' },
            { titulo: 'Como encomendar?', texto: 'Simples! Mande mensagem no WhatsApp' },
            { titulo: 'Personalizado', texto: 'Do seu jeito, do seu tamanho' },
            { titulo: 'Encomende já!', texto: link_whatsapp ?? 'WhatsApp no perfil' },
          ] : null,
          stories: isStory ? [
            { tela:1, texto:`${produto} chegou! 🎂`, acao:'Arraste para ver mais' },
            { tela:2, texto:'Feito com amor e ingredientes de qualidade', acao:'Continue assistindo' },
            { tela:3, texto:'Encomende pelo WhatsApp!', acao:'Clique no link da bio' },
          ] : null,
          melhor_rede: 'Instagram',
          melhor_horario: '18h–21h',
          dica: '⚠️ Configure a variável OPENROUTER_API_KEY na Vercel para geração real com IA.',
        },
        aviso: 'Conteúdo de demonstração. Configure OPENROUTER_API_KEY na Vercel para IA real.'
      })
    }

    // ✅ OpenRouter — formato OpenAI, modelos gratuitos disponíveis
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://seusite.com.br', // opcional mas recomendado
        'X-Title': 'Gerador de Conteúdo',          // aparece no dashboard do OpenRouter
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it:free', // modelo gratuito — veja opções abaixo
        max_tokens: 1500,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user',   content: prompt },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ ok:false, erro:`Erro na API: ${err.slice(0,200)}` }, { status:500 })
    }

    const data = await response.json()
    const rawText = data.choices?.[0]?.message?.content ?? '{}'

    let parsed: any
    try { parsed = JSON.parse(rawText) }
    catch {
      const match = rawText.match(/\{[\s\S]*\}/)
      try { parsed = match ? JSON.parse(match[0]) : null } catch { parsed = null }
    }

    if (!parsed) return NextResponse.json({ ok:false, erro:'Falha ao interpretar resposta da IA.' }, { status:500 })

    return NextResponse.json({ ok:true, conteudo: parsed })

  } catch (err: any) {
    return NextResponse.json({ ok:false, erro: err.message }, { status:500 })
  }
}

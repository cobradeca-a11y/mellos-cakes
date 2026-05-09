import { createClient } from '@/lib/supabase/server'
import { RelatoriosTabs } from './RelatoriosTabs'

export const metadata = { title: 'Relatórios' }

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function toNumber(value: any): number {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

async function getData(ano: number, mes: number | null) {
  const supabase = createClient()
  const start = mes ? `${ano}-${String(mes).padStart(2,'0')}-01` : `${ano}-01-01`
  const end   = mes ? new Date(ano, mes, 0).toISOString().split('T')[0] : `${ano}-12-31`

  const [
    { data: orders },
    { data: cashflow },
    { data: cakeItems },
    { data: purchaseOrders },
    { data: ingredients },
  ] = await Promise.all([
    supabase.from('orders')
      .select('id, order_number, total_amount, estimated_cost, delivery_date, status, created_at, customer_id, customers(name)')
      .gte('delivery_date', start).lte('delivery_date', end).neq('status','cancelado')
      .order('delivery_date', { ascending: false }),
    supabase.from('cashflow_entries')
      .select('amount, type, category, description, date, paid').gte('date', start).lte('date', end),
    supabase.from('order_cake_items')
      .select(`quantity, base_price, surcharge, total_price,
        size:cake_sizes(name, label, servings),
        flavor1:cake_flavors!order_cake_items_flavor1_id_fkey(name),
        flavor2:cake_flavors!order_cake_items_flavor2_id_fkey(name),
        filling1:cake_fillings!order_cake_items_filling1_id_fkey(name, category),
        filling2:cake_fillings!order_cake_items_filling2_id_fkey(name, category),
        topping:cake_toppings(name),
        order:orders!inner(id, order_number, total_amount, estimated_cost, delivery_date, status)`)
      .gte('order.delivery_date', start).lte('order.delivery_date', end)
      .neq('order.status','cancelado'),
    supabase.from('purchase_orders')
      .select('id, status, total_amount, created_at, expected_delivery, suppliers(name), purchase_order_items(quantity, unit_price, total_price, ingredients(name, unit, category))')
      .gte('created_at', start).lte('created_at', `${end}T23:59:59`)
      .neq('status','cancelado')
      .order('created_at', { ascending: false }),
    supabase.from('ingredients')
      .select('id, name, category, unit, cost_per_unit, stock_quantity, min_stock, active, suppliers(name)')
      .eq('active', true)
      .order('name'),
  ])

  const safeOrders = orders ?? []
  const safeCashflow = cashflow ?? []
  const safeCakeItems = cakeItems ?? []
  const safePurchases = purchaseOrders ?? []
  const safeIngredients = ingredients ?? []

  // ── Financeiro gerencial ──
  const faturamento_bruto = safeOrders.reduce((s: number, o: any) => s + toNumber(o.total_amount), 0)
  const custo_producao = safeOrders.reduce((s: number, o: any) => s + toNumber(o.estimated_cost), 0)
  const receitas_recebidas = safeCashflow.filter((e: any) => e.type === 'receita' && e.paid).reduce((s: number, e: any) => s + toNumber(e.amount), 0)
  const receitas_pendentes = safeCashflow.filter((e: any) => e.type === 'receita' && !e.paid).reduce((s: number, e: any) => s + toNumber(e.amount), 0)
  const despesas_operacionais = safeCashflow.filter((e: any) => e.type === 'despesa' && e.paid).reduce((s: number, e: any) => s + toNumber(e.amount), 0)
  const despesas_pendentes = safeCashflow.filter((e: any) => e.type === 'despesa' && !e.paid).reduce((s: number, e: any) => s + toNumber(e.amount), 0)
  const compras_ingredientes = safePurchases.reduce((s: number, p: any) => s + toNumber(p.total_amount), 0)
  const compras_recebidas = safePurchases.filter((p: any) => p.status === 'recebido').reduce((s: number, p: any) => s + toNumber(p.total_amount), 0)
  const lucro_bruto = faturamento_bruto - custo_producao
  const lucro_liquido = faturamento_bruto - custo_producao - despesas_operacionais
  const margem_bruta = faturamento_bruto > 0 ? (lucro_bruto / faturamento_bruto) * 100 : 0
  const margem_liquida = faturamento_bruto > 0 ? (lucro_liquido / faturamento_bruto) * 100 : 0
  const total_pedidos = safeOrders.length
  const ticket_medio  = total_pedidos > 0 ? faturamento_bruto / total_pedidos : 0
  const custo_medio_pedido = total_pedidos > 0 ? custo_producao / total_pedidos : 0

  // ── Pedidos por mês ──
  const porMes: Record<string, { pedidos: number; faturamento: number; custo: number; lucro: number }> = {}
  safeOrders.forEach((o:any)=>{
    const m=o.delivery_date?.slice(0,7)
    if(!m) return
    if(!porMes[m]) porMes[m] = { pedidos: 0, faturamento: 0, custo: 0, lucro: 0 }
    porMes[m].pedidos += 1
    porMes[m].faturamento += toNumber(o.total_amount)
    porMes[m].custo += toNumber(o.estimated_cost)
    porMes[m].lucro = porMes[m].faturamento - porMes[m].custo
  })

  // ── Tamanhos ──
  const porTamanho: Record<string,{label:string;qty:number;receita:number}> = {}
  safeCakeItems.forEach((item:any)=>{
    const key = item.size?.name??'N/A'
    if(!porTamanho[key]) porTamanho[key]={label:item.size?.label??key,qty:0,receita:0}
    porTamanho[key].qty += toNumber(item.quantity)
    porTamanho[key].receita += toNumber(item.total_price) * toNumber(item.quantity)
  })

  // ── Massas ──
  const porMassa: Record<string,number> = {}
  safeCakeItems.forEach((item:any)=>{
    const f1=item.flavor1?.name; const f2=item.flavor2?.name
    if(f1) porMassa[f1]=(porMassa[f1]??0)+toNumber(item.quantity)
    if(f2&&f2!==f1) porMassa[f2]=(porMassa[f2]??0)+toNumber(item.quantity)
  })

  // ── Recheios ──
  const porRecheio: Record<string,number> = {}
  safeCakeItems.forEach((item:any)=>{
    const r1=item.filling1?.name; const r2=item.filling2?.name
    if(r1) porRecheio[r1]=(porRecheio[r1]??0)+toNumber(item.quantity)
    if(r2) porRecheio[r2]=(porRecheio[r2]??0)+toNumber(item.quantity)
  })

  // ── Coberturas ──
  const porCobertura: Record<string,number> = {}
  safeCakeItems.forEach((item:any)=>{
    const t=item.topping?.name
    if(t) porCobertura[t]=(porCobertura[t]??0)+toNumber(item.quantity)
  })

  // ── Clientes ──
  const porCliente: Record<string,{nome:string;pedidos:number;total:number}> = {}
  safeOrders.forEach((o:any)=>{
    const nome=o.customers?.name??'Sem cadastro'
    if(!porCliente[nome]) porCliente[nome]={nome,pedidos:0,total:0}
    porCliente[nome].pedidos += 1
    porCliente[nome].total += toNumber(o.total_amount)
  })

  // ── Despesas por categoria ──
  const despesasPorCategoria: Record<string, { total: number; lancamentos: number }> = {}
  safeCashflow.filter((e:any)=>e.type==='despesa').forEach((e:any)=>{
    const key = e.category || 'Sem categoria'
    if(!despesasPorCategoria[key]) despesasPorCategoria[key] = { total: 0, lancamentos: 0 }
    despesasPorCategoria[key].total += toNumber(e.amount)
    despesasPorCategoria[key].lancamentos += 1
  })

  // ── Compras por fornecedor e por ingrediente ──
  const comprasPorFornecedor: Record<string, { total: number; pedidos: number }> = {}
  const comprasPorIngrediente: Record<string, { total: number; quantidade: number; unidade: string; categoria: string }> = {}
  safePurchases.forEach((p:any)=>{
    const fornecedor = p.suppliers?.name || 'Sem fornecedor'
    if(!comprasPorFornecedor[fornecedor]) comprasPorFornecedor[fornecedor] = { total: 0, pedidos: 0 }
    comprasPorFornecedor[fornecedor].total += toNumber(p.total_amount)
    comprasPorFornecedor[fornecedor].pedidos += 1

    ;(p.purchase_order_items ?? []).forEach((item:any)=>{
      const nome = item.ingredients?.name || 'Ingrediente não identificado'
      if(!comprasPorIngrediente[nome]) comprasPorIngrediente[nome] = {
        total: 0,
        quantidade: 0,
        unidade: item.ingredients?.unit || '',
        categoria: item.ingredients?.category || 'Sem categoria',
      }
      comprasPorIngrediente[nome].total += toNumber(item.total_price)
      comprasPorIngrediente[nome].quantidade += toNumber(item.quantity)
    })
  })

  // ── Estoque ──
  const estoque_valorizado = safeIngredients.reduce((s:number, ing:any)=>s + toNumber(ing.stock_quantity) * toNumber(ing.cost_per_unit), 0)
  const ingredientesBaixoEstoque = safeIngredients
    .filter((ing:any)=>toNumber(ing.stock_quantity) <= toNumber(ing.min_stock))
    .map((ing:any)=>({
      nome: ing.name,
      categoria: ing.category || 'Sem categoria',
      fornecedor: ing.suppliers?.name || '—',
      estoque: toNumber(ing.stock_quantity),
      minimo: toNumber(ing.min_stock),
      unidade: ing.unit,
      valor_estoque: toNumber(ing.stock_quantity) * toNumber(ing.cost_per_unit),
    }))

  const estoquePorCategoria: Record<string, { valor: number; itens: number }> = {}
  safeIngredients.forEach((ing:any)=>{
    const key = ing.category || 'Sem categoria'
    if(!estoquePorCategoria[key]) estoquePorCategoria[key] = { valor: 0, itens: 0 }
    estoquePorCategoria[key].valor += toNumber(ing.stock_quantity) * toNumber(ing.cost_per_unit)
    estoquePorCategoria[key].itens += 1
  })

  // ── Fluxo projetado ──
  const a_receber = receitas_pendentes
  const a_pagar = despesas_pendentes
  const saldo_atual = receitas_recebidas - despesas_operacionais - compras_recebidas
  const saldo_projetado = saldo_atual + a_receber - a_pagar

  return {
    resumo: {
      faturamento_bruto,
      receitas_recebidas,
      receitas_pendentes,
      despesas_operacionais,
      despesas_pendentes,
      custo_producao,
      compras_ingredientes,
      compras_recebidas,
      lucro_bruto,
      lucro_liquido,
      total_pedidos,
      ticket_medio,
      custo_medio_pedido,
      margem_bruta,
      margem_liquida,
      estoque_valorizado,
    },
    dre: [
      { label: 'Faturamento bruto dos pedidos', value: faturamento_bruto, type: 'positive' },
      { label: '(-) Custo de produção / ingredientes usados', value: -custo_producao, type: 'negative' },
      { label: '= Lucro bruto', value: lucro_bruto, type: 'result' },
      { label: '(-) Despesas operacionais pagas', value: -despesas_operacionais, type: 'negative' },
      { label: '= Lucro líquido gerencial', value: lucro_liquido, type: 'final' },
    ],
    porMes: Object.entries(porMes).sort((a,b)=>a[0].localeCompare(b[0])),
    porTamanho: Object.entries(porTamanho).sort((a,b)=>b[1].qty-a[1].qty),
    porMassa: Object.entries(porMassa).sort((a,b)=>b[1]-a[1]),
    porCobertura: Object.entries(porCobertura).sort((a,b)=>b[1]-a[1]),
    porRecheio: Object.entries(porRecheio).sort((a,b)=>b[1]-a[1]),
    clientes: Object.values(porCliente).sort((a,b)=>b.pedidos-a.pedidos),
    despesasPorCategoria: Object.entries(despesasPorCategoria).sort((a,b)=>b[1].total-a[1].total),
    comprasPorFornecedor: Object.entries(comprasPorFornecedor).sort((a,b)=>b[1].total-a[1].total),
    comprasPorIngrediente: Object.entries(comprasPorIngrediente).sort((a,b)=>b[1].total-a[1].total),
    ingredientesBaixoEstoque,
    estoquePorCategoria: Object.entries(estoquePorCategoria).sort((a,b)=>b[1].valor-a[1].valor),
    pedidosDetalhados: safeOrders.map((o:any)=>({
      numero: o.order_number || o.id?.slice(0,8),
      cliente: o.customers?.name || 'Sem cadastro',
      data: o.delivery_date,
      status: o.status,
      faturamento: toNumber(o.total_amount),
      custo: toNumber(o.estimated_cost),
      lucro: toNumber(o.total_amount) - toNumber(o.estimated_cost),
    })),
    fluxo: { saldo_atual, a_receber, a_pagar, saldo_projetado },
    periodo: '',
    ano: 0, mes: 0,
  }
}

export default async function RelatoriosPage({ searchParams }: { searchParams: { ano?: string; mes?: string } }) {
  const anoAtual = new Date().getFullYear()
  const ano = Number(searchParams.ano ?? anoAtual)
  const mes = searchParams.mes ? Number(searchParams.mes) : null
  const periodo = mes ? `${MESES[mes-1]} ${ano}` : `Ano ${ano}`

  const data = await getData(ano, mes)
  data.periodo = periodo
  data.ano = ano
  data.mes = mes ?? 0

  return <RelatoriosTabs data={data} meses={MESES} anoAtual={anoAtual} />
}

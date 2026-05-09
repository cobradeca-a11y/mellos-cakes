import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { RelatoriosTabs } from './RelatoriosTabs'

export const metadata = { title: 'Relatórios' }

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

async function getData(ano: number, mes: number | null) {
  const supabase = createClient()
  const start = mes ? `${ano}-${String(mes).padStart(2,'0')}-01` : `${ano}-01-01`
  const end   = mes ? new Date(ano, mes, 0).toISOString().split('T')[0] : `${ano}-12-31`

  const [{ data: orders }, { data: cashflow }, { data: cakeItems }] = await Promise.all([
    supabase.from('orders')
      .select('id, total_amount, estimated_cost, delivery_date, status, created_at, customer_id, customers(name)')
      .gte('delivery_date', start).lte('delivery_date', end).neq('status','cancelado'),
    supabase.from('cashflow_entries')
      .select('amount, type, date, paid').gte('date', start).lte('date', end),
    supabase.from('order_cake_items')
      .select(`quantity, base_price, surcharge, total_price,
        size:cake_sizes(name, label, servings),
        flavor1:cake_flavors!order_cake_items_flavor1_id_fkey(name),
        flavor2:cake_flavors!order_cake_items_flavor2_id_fkey(name),
        filling1:cake_fillings!order_cake_items_filling1_id_fkey(name, category),
        filling2:cake_fillings!order_cake_items_filling2_id_fkey(name, category),
        topping:cake_toppings(name),
        order:orders!inner(delivery_date, status)`)
      .gte('order.delivery_date', start).lte('order.delivery_date', end)
      .neq('order.status','cancelado'),
  ])

  // ── Financeiro ──
  const receitas = (cashflow??[]).filter(e=>e.type==='receita'&&e.paid).reduce((s,e)=>s+e.amount,0)
  const despesas = (cashflow??[]).filter(e=>e.type==='despesa'&&e.paid).reduce((s,e)=>s+e.amount,0)
  const total_pedidos = orders?.length ?? 0
  const ticket_medio  = total_pedidos > 0 ? (orders??[]).reduce((s,o)=>s+o.total_amount,0)/total_pedidos : 0
  const margem = receitas > 0 ? ((receitas-despesas)/receitas*100) : 0

  // ── Pedidos por mês ──
  const porMes: Record<string,number> = {}
  ;(orders??[]).forEach((o:any)=>{ const m=o.delivery_date?.slice(0,7); if(m) porMes[m]=(porMes[m]??0)+1 })

  // ── Tamanhos ──
  const porTamanho: Record<string,{label:string;qty:number;receita:number}> = {}
  ;(cakeItems??[]).forEach((item:any)=>{
    const key = item.size?.name??'N/A'
    if(!porTamanho[key]) porTamanho[key]={label:item.size?.label??key,qty:0,receita:0}
    porTamanho[key].qty+=item.quantity; porTamanho[key].receita+=item.total_price*item.quantity
  })

  // ── Massas ──
  const porMassa: Record<string,number> = {}
  ;(cakeItems??[]).forEach((item:any)=>{
    const f1=item.flavor1?.name; const f2=item.flavor2?.name
    if(f1) porMassa[f1]=(porMassa[f1]??0)+item.quantity
    if(f2&&f2!==f1) porMassa[f2]=(porMassa[f2]??0)+item.quantity
  })

  // ── Recheios ──
  const porRecheio: Record<string,number> = {}
  ;(cakeItems??[]).forEach((item:any)=>{
    const r1=item.filling1?.name; const r2=item.filling2?.name
    if(r1) porRecheio[r1]=(porRecheio[r1]??0)+item.quantity
    if(r2) porRecheio[r2]=(porRecheio[r2]??0)+item.quantity
  })

  // ── Coberturas ──
  const porCobertura: Record<string,number> = {}
  ;(cakeItems??[]).forEach((item:any)=>{
    const t=item.topping?.name
    if(t) porCobertura[t]=(porCobertura[t]??0)+item.quantity
  })

  // ── Clientes ──
  const porCliente: Record<string,{nome:string;pedidos:number;total:number}> = {}
  ;(orders??[]).forEach((o:any)=>{
    const nome=o.customers?.name??'Sem cadastro'
    if(!porCliente[nome]) porCliente[nome]={nome,pedidos:0,total:0}
    porCliente[nome].pedidos+=1; porCliente[nome].total+=o.total_amount
  })

  // ── Fluxo projetado ──
  const a_receber = (cashflow??[]).filter(e=>e.type==='receita'&&!e.paid).reduce((s,e)=>s+e.amount,0)
  const a_pagar   = (cashflow??[]).filter(e=>e.type==='despesa'&&!e.paid).reduce((s,e)=>s+e.amount,0)

  return {
    // resumo executivo
    resumo: { receitas, despesas, lucro: receitas-despesas, total_pedidos, ticket_medio, margem },
    // por mês
    porMes: Object.entries(porMes).sort((a,b)=>a[0].localeCompare(b[0])),
    // categorias
    porTamanho: Object.entries(porTamanho).sort((a,b)=>b[1].qty-a[1].qty),
    porMassa: Object.entries(porMassa).sort((a,b)=>b[1]-a[1]),
    porCobertura: Object.entries(porCobertura).sort((a,b)=>b[1]-a[1]),
    // recheios
    porRecheio: Object.entries(porRecheio).sort((a,b)=>b[1]-a[1]),
    // clientes
    clientes: Object.values(porCliente).sort((a,b)=>b.pedidos-a.pedidos),
    // fluxo
    fluxo: { saldo_atual: receitas-despesas, a_receber, a_pagar, saldo_projetado: receitas-despesas+a_receber-a_pagar },
    // meta
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

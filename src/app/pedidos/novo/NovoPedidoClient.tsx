'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CakeOrderForm } from '../CakeOrderForm'
import { formatCurrency } from '@/lib/utils'
import { Loader2, Calendar, User, CreditCard, FileText } from 'lucide-react'
import { generateOrderNumber } from '@/lib/utils'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'
const PAYMENTS = ['pix','dinheiro','cartao_credito','cartao_debito','transferencia']

export function NovoPedidoClient({ customers, sizes, flavors, fillings, toppings, defaultCustomerId }: any) {
  const router = useRouter()
  const supabase = createClient()

  const [cakeItems, setCakeItems]     = useState<any[]>([])
  const [cakeTotal, setCakeTotal]     = useState(0)
  const [customerId, setCustomerId]   = useState(defaultCustomerId ?? '')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [depositPaid, setDepositPaid] = useState(0)
  const [notes, setNotes]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const balanceDue = Math.max(0, cakeTotal - depositPaid)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deliveryDate) { setError('Informe a data de entrega.'); return }
    if (cakeItems.length === 0 || !cakeItems[0].sizeId) { setError('Configure pelo menos um bolo.'); return }

    setLoading(true); setError('')

    try {
      // 1. Criar pedido
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        business_id: BUSINESS_ID,
        customer_id: customerId || null,
        order_number: generateOrderNumber(),
        status: 'confirmado',
        total_amount: cakeTotal,
        deposit_paid: depositPaid,
        balance_due: balanceDue,
        payment_method: paymentMethod || null,
        delivery_date: deliveryDate,
        notes: notes || null,
      }).select().single()

      if (orderErr) throw orderErr

      // 2. Criar itens de bolo
      if (cakeItems.length > 0) {
        const size = sizes.find((s: any) => s.id === cakeItems[0].sizeId)
        const sKey = size?.name.toLowerCase()

        const cakeRows = cakeItems
          .filter((item: any) => item.sizeId)
          .map((item: any) => {
            const s  = sizes.find((x: any) => x.id === item.sizeId)
            const f1 = fillings.find((x: any) => x.id === item.filling1Id)
            const f2 = fillings.find((x: any) => x.id === item.filling2Id)
            const tp = toppings.find((x: any) => x.id === item.toppingId)
            const sk = s?.name.toLowerCase()
            const sur = (f1?.has_surcharge ? (f1[`surcharge_${sk}`] ?? 0) : 0)
                      + (f2?.has_surcharge ? (f2[`surcharge_${sk}`] ?? 0) : 0)
                      + (tp?.has_surcharge ? (tp[`surcharge_${sk}`] ?? 0) : 0)
            return {
              order_id:    order.id,
              size_id:     item.sizeId    || null,
              flavor1_id:  item.flavor1Id || null,
              flavor2_id:  item.flavor2Id || null,
              filling1_id: item.filling1Id|| null,
              filling2_id: item.filling2Id|| null,
              topping_id:  item.toppingId || null,
              quantity:    item.qty,
              base_price:  s?.base_price ?? 0,
              surcharge:   sur,
              total_price: (s?.base_price ?? 0) + sur,
              notes:       item.notes || null,
            }
          })

        if (cakeRows.length > 0) {
          await supabase.from('order_cake_items').insert(cakeRows)
        }
      }

      router.push(`/pedidos/${order.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar pedido.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Cliente e data */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <User className="w-4 h-4 text-brand-500" /> Dados do Pedido
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Cliente</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="input">
              <option value="">Selecione</option>
              {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Data e hora da entrega *</label>
            <input type="datetime-local" value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)} required className="input" />
          </div>
        </div>
      </div>

      {/* Configuração dos bolos */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          🎂 Configuração dos Bolos
        </h3>
        <CakeOrderForm
          sizes={sizes} flavors={flavors} fillings={fillings} toppings={toppings}
          onChange={(items, total) => { setCakeItems(items); setCakeTotal(total) }}
        />
      </div>

      {/* Financeiro */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <CreditCard className="w-4 h-4 text-brand-500" /> Pagamento
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Total calculado</label>
            <div className="input font-bold text-brand-500 cursor-default" style={{ background: 'var(--hover)' }}>
              {formatCurrency(cakeTotal)}
            </div>
          </div>
          <div>
            <label className="label">Sinal pago (R$)</label>
            <input type="number" step="0.01" min="0" value={depositPaid || ''}
              onChange={e => setDepositPaid(Number(e.target.value))}
              placeholder="0,00" className="input" />
          </div>
          <div>
            <label className="label">Saldo pendente</label>
            <div className="input cursor-default font-semibold"
              style={{ background: 'var(--hover)', color: balanceDue > 0 ? '#dc2626' : '#16a34a' }}>
              {formatCurrency(balanceDue)}
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="label">Forma de pagamento</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="input">
              <option value="">Selecione</option>
              {PAYMENTS.map(p => <option key={p} value={p}>{p.replace('_',' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Observações gerais */}
      <div className="card p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <FileText className="w-4 h-4 text-brand-500" /> Observações gerais
        </h3>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Informações adicionais sobre o pedido..."
          className="input resize-none" />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Total: <strong style={{ color: 'var(--brand)' }}>{formatCurrency(cakeTotal)}</strong>
        </p>
        <button type="submit" disabled={loading} className="btn-primary px-8">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Confirmar Pedido'}
        </button>
      </div>
    </form>
  )
}

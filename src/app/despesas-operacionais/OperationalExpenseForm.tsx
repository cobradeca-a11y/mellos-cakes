'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Despesa'}
    </button>
  )
}

const CATEGORIES = [
  'Descartáveis',
  'Gás de cozinha',
  'Combustível',
  'Embalagens',
  'Limpeza',
  'Energia elétrica',
  'Água',
  'Manutenção',
  'Entrega/Frete',
  'Taxas',
  'Equipamentos',
  'Outros',
]

const STOCK_UNITS = ['kg', 'pacote', 'litro', 'unidade', 'caixa', 'metro', 'rolo', 'botijão', 'outros']
const PAYMENTS = ['pix','dinheiro','cartao_credito','cartao_debito','transferencia','vr','outros']

const STOCK_BLOCK_START = '--- DADOS DE ESTOQUE ---'
const STOCK_BLOCK_END = '--- FIM DADOS DE ESTOQUE ---'

type StockData = {
  baseNotes: string
  item: string
  unit: string
  quantity: string
  expiryDate: string
  supplierName: string
}

function parseStockData(notes?: string | null): StockData {
  const raw = notes ?? ''
  const start = raw.indexOf(STOCK_BLOCK_START)
  const end = raw.indexOf(STOCK_BLOCK_END)

  const data: StockData = {
    baseNotes: raw.trim(),
    item: '',
    unit: '',
    quantity: '',
    expiryDate: '',
    supplierName: '',
  }

  if (start === -1 || end === -1 || end < start) return data

  data.baseNotes = `${raw.slice(0, start)}${raw.slice(end + STOCK_BLOCK_END.length)}`.trim()
  const block = raw.slice(start + STOCK_BLOCK_START.length, end)

  for (const line of block.split('\n')) {
    const [label, ...rest] = line.split(':')
    const value = rest.join(':').trim()
    if (!value) continue

    if (label.trim() === 'Item de estoque') data.item = value
    if (label.trim() === 'Unidade') data.unit = value
    if (label.trim() === 'Quantidade') data.quantity = value
    if (label.trim() === 'Validade') data.expiryDate = value
    if (label.trim() === 'Fornecedor') data.supplierName = value
  }

  return data
}

export function OperationalExpenseForm({
  action,
  defaultValues = {},
}: {
  action: (fd: FormData) => Promise<void>
  defaultValues?: Record<string, any>
}) {
  const stockData = parseStockData(defaultValues.notes)

  return (
    <form action={action} className="space-y-5">
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Despesa Operacional</h3>
        <p className="text-sm text-[var(--text-3)]">
          Use esta tela para gastos que não são ingredientes da receita, mas fazem parte da operação da Mello's Cakes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Data da compra *</label>
            <input
              type="date"
              name="date"
              required
              defaultValue={defaultValues.date ?? new Date().toISOString().split('T')[0]}
              className="input"
            />
          </div>

          <div>
            <label className="label">Categoria *</label>
            <input name="category" required list="operational-expense-categories" defaultValue={defaultValues.category ?? ''} className="input" />
            <datalist id="operational-expense-categories">
              {CATEGORIES.map(category => <option key={category} value={category} />)}
            </datalist>
          </div>

          <div className="md:col-span-2">
            <label className="label">Descrição *</label>
            <input
              name="description"
              required
              defaultValue={defaultValues.description ?? ''}
              placeholder="Ex: botijão de gás, copo descartável, combustível para entrega..."
              className="input"
            />
          </div>

          <div>
            <label className="label">Valor total (R$) *</label>
            <input type="number" step="0.01" min="0" name="amount" required defaultValue={defaultValues.amount ?? ''} className="input" />
          </div>

          <div>
            <label className="label">Forma de pagamento</label>
            <select name="payment_method" className="input" defaultValue={defaultValues.payment_method ?? ''}>
              <option value="">Selecione</option>
              {PAYMENTS.map(payment => <option key={payment} value={payment}>{payment.replaceAll('_', ' ')}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select name="paid" className="input" defaultValue={defaultValues.paid === false ? 'false' : 'true'}>
              <option value="true">Pago</option>
              <option value="false">Pendente</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Dados de estoque / controle interno</h3>
        <p className="text-sm text-[var(--text-3)]">
          Preencha quando a despesa também precisa de controle físico, como gás, descartáveis, embalagens, combustível ou material de limpeza.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Item</label>
            <input name="stock_item" defaultValue={stockData.item} placeholder="Ex: gás de cozinha" className="input" />
          </div>

          <div>
            <label className="label">Fornecedor</label>
            <input name="supplier_name" defaultValue={stockData.supplierName} placeholder="Ex: fornecedor do gás" className="input" />
          </div>

          <div>
            <label className="label">Quantidade</label>
            <input type="number" step="0.001" min="0" name="stock_quantity" defaultValue={stockData.quantity} className="input" />
          </div>

          <div>
            <label className="label">Unidade</label>
            <input name="stock_unit" list="operational-stock-units" defaultValue={stockData.unit} placeholder="kg, pacote, litros..." className="input" />
            <datalist id="operational-stock-units">
              {STOCK_UNITS.map(unit => <option key={unit} value={unit} />)}
            </datalist>
          </div>

          <div>
            <label className="label">Validade</label>
            <input type="date" name="stock_expiry_date" defaultValue={stockData.expiryDate} className="input" />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Observações</h3>
        <textarea name="notes" rows={3} defaultValue={stockData.baseNotes} className="input resize-none" />
      </div>

      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  )
}

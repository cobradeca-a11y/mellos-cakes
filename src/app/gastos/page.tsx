import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Plus, Flame, Truck, Package, Utensils, Sparkles, Trash2 } from 'lucide-react'
import { GastoForm } from './GastoForm'
import { createGasto, deleteGasto } from './actions'
import { DeleteButton } from '@/components/ui/DeleteButton'

export const metadata = { title: 'Gastos Operacionais' }

const ICON_MAP: Record<string, any> = {
  'Gás': Flame, 'Energia': Flame, 'Água': Flame,
  'Combustível': Truck, 'Uber': Truck, 'Manutenção do veículo': Truck,
  'Caixas': Package, 'Sacos': Package, 'Fitas': Package, 'Papel': Package, 'Filme': Package, 'Embalagens': Package,
  'Talheres': Utensils, 'Pratos': Utensils, 'Copos': Utensils, 'Guardanapos': Utensils,
}

function getIcon(category: string) {
  const Icon = Object.entries(ICON_MAP).find(([k]) => category.includes(k))?.[1] ?? Sparkles
  return Icon
}

const CATEGORIAS_OPERACIONAIS = [
  'Gás de cozinha P13', 'Gás de cozinha P45', 'Energia elétrica', 'Água',
  'Combustível', 'Uber/Táxi', 'Manutenção do veículo', 'Estacionamento',
  'Caixas de bolo', 'Caixas de doces', 'Sacos/sacolas', 'Fitas e laços', 'Papel manteiga', 'Filme PVC',
  'Talheres descartáveis', 'Pratos descartáveis', 'Copos descartáveis', 'Guardanapos',
  'Produtos de limpeza', 'Álcool/desinfetante', 'Luvas descartáveis',
  'Manutenção de equipamentos', 'Material de escritório', 'Taxa/imposto', 'Outros',
]

export default async function GastosPage({ searchParams }: { searchParams: { mes?: string } }) {
  const supabase = createClient()
  const hoje = new Date()
  const mes = searchParams.mes ?? `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
  const [anoStr, mesStr] = mes.split('-')
  const inicio = `${anoStr}-${mesStr}-01`
  const fim = new Date(Number(anoStr), Number(mesStr), 0).toISOString().split('T')[0]

  const { data: gastos } = await supabase
    .from('cashflow_entries')
    .select('*')
    .eq('type', 'despesa')
    .in('category', CATEGORIAS_OPERACIONAIS)
    .gte('date', inicio)
    .lte('date', fim)
    .order('date', { ascending: false })

  const total = (gastos ?? []).reduce((s, g) => s + (g.amount ?? 0), 0)

  // Agrupado por categoria
  const porCategoria = (gastos ?? []).reduce((acc: Record<string, number>, g) => {
    acc[g.category] = (acc[g.category] ?? 0) + g.amount
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gastos Operacionais</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">Gás, combustível, embalagens e descartáveis</p>
        </div>
      </div>

      {/* Filtro de mês */}
      <form className="card p-4 flex items-center gap-3">
        <label className="label mb-0 shrink-0">Mês:</label>
        <input type="month" name="mes" defaultValue={mes} className="input w-auto" />
        <button type="submit" className="btn-primary">Filtrar</button>
      </form>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 col-span-2 md:col-span-1 flex flex-col justify-center">
          <p className="text-xs text-[var(--muted)] mb-1">Total do mês</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(total)}</p>
        </div>
        {Object.entries(porCategoria).slice(0, 3).map(([cat, val]) => {
          const Icon = getIcon(cat)
          return (
            <div key={cat} className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-[var(--muted)]" />
                <p className="text-xs text-[var(--muted)] truncate">{cat}</p>
              </div>
              <p className="text-lg font-bold text-[var(--text-1)]">{formatCurrency(val)}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Formulário */}
        <div>
          <h2 className="font-semibold text-[var(--text-1)] mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Registrar novo gasto
          </h2>
          <GastoForm action={createGasto} />
        </div>

        {/* Lista */}
        <div>
          <h2 className="font-semibold text-[var(--text-1)] mb-3">
            Lançamentos — {new Date(Number(anoStr), Number(mesStr) - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          {(gastos ?? []).length === 0 ? (
            <div className="card p-10 text-center text-[var(--muted)]">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum gasto registrado neste mês</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(gastos ?? []).map((g: any) => {
                    const Icon = getIcon(g.category)
                    return (
                      <tr key={g.id}>
                        <td className="text-xs text-[var(--muted)] whitespace-nowrap">
                          {new Date(g.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </td>
                        <td>
                          <span className="flex items-center gap-1.5 text-sm">
                            <Icon className="w-3.5 h-3.5 text-[var(--muted)]" />
                            <span className="truncate max-w-[120px]">{g.category}</span>
                          </span>
                        </td>
                        <td className="text-sm text-[var(--text-2)] max-w-[140px] truncate">{g.description}</td>
                        <td className="font-semibold text-red-500 whitespace-nowrap">{formatCurrency(g.amount)}</td>
                        <td>
                          <DeleteButton
                            action={async () => { 'use server'; await deleteGasto(g.id) }}
                            confirmMessage={`Excluir "${g.description}" (${formatCurrency(g.amount)})?`}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-sm font-semibold text-right text-[var(--text-2)]">Total:</td>
                    <td className="font-bold text-red-500">{formatCurrency(total)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

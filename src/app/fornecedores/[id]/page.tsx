import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Phone, Mail, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function FornecedorDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [{ data: supplier }, { data: ingredients }] = await Promise.all([
    supabase.from('suppliers').select('*').eq('id', params.id).single(),
    supabase.from('ingredients').select('id, name, unit, cost_per_unit, stock_quantity').eq('supplier_id', params.id).eq('active', true).order('name'),
  ])
  if (!supplier) notFound()

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/fornecedores" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="page-title">{supplier.name}</h1>
        </div>
        <Link href={`/fornecedores/${params.id}/editar`} className="btn-secondary">
          <Edit2 className="w-4 h-4" /> Editar
        </Link>
      </div>

      <div className="card p-5 space-y-3">
        {supplier.contact_name && <p className="text-sm text-neutral-600">Contato: <strong>{supplier.contact_name}</strong></p>}
        <div className="flex flex-wrap gap-4">
          {supplier.phone && (
            <a href={`tel:${supplier.phone}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-brand-500">
              <Phone className="w-4 h-4 text-neutral-400" /> {supplier.phone}
            </a>
          )}
          {supplier.email && (
            <a href={`mailto:${supplier.email}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-brand-500">
              <Mail className="w-4 h-4 text-neutral-400" /> {supplier.email}
            </a>
          )}
        </div>
        {supplier.notes && <p className="text-sm text-neutral-500 italic">{supplier.notes}</p>}
      </div>

      <div className="table-container">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-neutral-400" /> Ingredientes fornecidos
          </h3>
          <Link href={`/compras/nova?fornecedor=${params.id}`} className="btn-primary text-xs py-1.5 px-3">
            + Fazer Pedido
          </Link>
        </div>
        <table className="table">
          <thead><tr><th>Ingrediente</th><th>Unidade</th><th>Custo/Un.</th><th>Estoque</th></tr></thead>
          <tbody>
            {(ingredients ?? []).length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-neutral-400">Nenhum ingrediente vinculado</td></tr>
            ) : (
              (ingredients ?? []).map(i => (
                <tr key={i.id}>
                  <td className="font-medium text-neutral-900">{i.name}</td>
                  <td className="font-mono text-sm">{i.unit}</td>
                  <td>{formatCurrency(i.cost_per_unit)}</td>
                  <td>{i.stock_quantity} {i.unit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateSupplier } from '../../actions'
import { SupplierForm } from '../../SupplierForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditarFornecedorPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: supplier } = await supabase.from('suppliers').select('*').eq('id', params.id).single()
  if (!supplier) notFound()
  const action = updateSupplier.bind(null, params.id)
  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/fornecedores" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Editar Fornecedor</h1>
      </div>
      <SupplierForm action={action} defaultValues={supplier} />
    </div>
  )
}

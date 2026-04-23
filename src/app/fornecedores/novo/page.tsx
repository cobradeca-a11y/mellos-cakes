import { createSupplier } from '../actions'
import { SupplierForm } from '../SupplierForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Novo Fornecedor' }

export default function NovoFornecedorPage() {
  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/fornecedores" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Novo Fornecedor</h1>
      </div>
      <SupplierForm action={createSupplier} />
    </div>
  )
}

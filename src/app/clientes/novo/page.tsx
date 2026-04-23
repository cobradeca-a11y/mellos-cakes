import { createCustomer } from '../actions'
import { CustomerForm } from '../CustomerForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Novo Cliente' }

export default function NovoClientePage() {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="page-title">Novo Cliente</h1>
      </div>
      <CustomerForm action={createCustomer} />
    </div>
  )
}

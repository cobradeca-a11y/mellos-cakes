import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CustomerForm } from '../../CustomerForm'
import { updateCustomer } from '../../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Editar Cliente' }

export default async function EditarClientePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: customer } = await supabase.from('customers').select('*').eq('id', params.id).single()
  if (!customer) notFound()

  const action = updateCustomer.bind(null, params.id)

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/clientes/${params.id}`} className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Editar Cliente</h1>
      </div>
      <CustomerForm action={action} defaultValues={customer} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateOperationalExpense } from '../../actions'
import { OperationalExpenseForm } from '../../OperationalExpenseForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Editar Despesa Operacional' }

export default async function EditarDespesaOperacionalPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: expense } = await supabase
    .from('cashflow_entries')
    .select('*')
    .eq('id', params.id)
    .eq('type', 'despesa')
    .single()

  if (!expense) notFound()

  const action = updateOperationalExpense.bind(null, params.id)

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/despesas-operacionais" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Editar Despesa Operacional</h1>
      </div>
      <OperationalExpenseForm action={action} defaultValues={expense} />
    </div>
  )
}

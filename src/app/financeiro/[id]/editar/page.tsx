import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateEntry } from '../../actions'
import { CashflowForm } from '../../CashflowForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditarLancamentoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: entry } = await supabase.from('cashflow_entries').select('*').eq('id', params.id).single()
  if (!entry) notFound()
  const action = updateEntry.bind(null, params.id)
  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/financeiro" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Editar Lançamento</h1>
      </div>
      <CashflowForm action={action} defaultValues={entry} />
    </div>
  )
}

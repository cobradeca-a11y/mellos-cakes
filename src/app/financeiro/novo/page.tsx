import { createEntry } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CashflowForm } from '../CashflowForm'

export const metadata = { title: 'Novo Lançamento' }

export default function NovoLancamentoPage() {
  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/financeiro" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Novo Lançamento</h1>
      </div>
      <CashflowForm action={createEntry} />
    </div>
  )
}

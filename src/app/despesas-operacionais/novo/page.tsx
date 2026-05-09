import { createOperationalExpense } from '../actions'
import { OperationalExpenseForm } from '../OperationalExpenseForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Nova Despesa Operacional' }

export default function NovaDespesaOperacionalPage() {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/despesas-operacionais" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Nova Despesa Operacional</h1>
      </div>
      <OperationalExpenseForm action={createOperationalExpense} />
    </div>
  )
}

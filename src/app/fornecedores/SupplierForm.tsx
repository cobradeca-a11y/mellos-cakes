'use client'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Fornecedor'}
    </button>
  )
}

export function SupplierForm({ action, defaultValues = {} }: { action: (fd: FormData) => Promise<void>; defaultValues?: Record<string, any> }) {
  return (
    <form action={action} className="card p-6 space-y-4">
      <h3 className="font-semibold text-neutral-800">Dados do Fornecedor</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Nome *</label>
          <input name="name" required defaultValue={defaultValues.name} className="input" />
        </div>
        <div>
          <label className="label">Contato</label>
          <input name="contact_name" defaultValue={defaultValues.contact_name ?? ''} placeholder="Nome do responsável" className="input" />
        </div>
        <div>
          <label className="label">Telefone</label>
          <input name="phone" defaultValue={defaultValues.phone ?? ''} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label">E-mail</label>
          <input type="email" name="email" defaultValue={defaultValues.email ?? ''} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Observações</label>
          <textarea name="notes" rows={3} defaultValue={defaultValues.notes ?? ''} className="input resize-none" />
        </div>
      </div>
      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  )
}

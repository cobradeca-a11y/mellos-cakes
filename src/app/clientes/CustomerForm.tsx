'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : label}
    </button>
  )
}

interface CustomerFormProps {
  action: (fd: FormData) => Promise<void>
  defaultValues?: {
    name?: string; phone?: string; email?: string; birthdate?: string
    preferences?: string; restrictions?: string; notes?: string
  }
}

export function CustomerForm({ action, defaultValues = {} }: CustomerFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Nome *</label>
            <input name="name" required defaultValue={defaultValues.name} placeholder="Nome completo" className="input" />
          </div>
          <div>
            <label className="label">Telefone / WhatsApp</label>
            <input name="phone" defaultValue={defaultValues.phone ?? ''} placeholder="(11) 99999-9999" className="input" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" name="email" defaultValue={defaultValues.email ?? ''} placeholder="cliente@email.com" className="input" />
          </div>
          <div>
            <label className="label">Data de Aniversário</label>
            <input type="date" name="birthdate" defaultValue={defaultValues.birthdate ?? ''} className="input" />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Preferências & Observações</h3>
        <div>
          <label className="label">Preferências</label>
          <textarea name="preferences" defaultValue={defaultValues.preferences ?? ''} rows={2}
            placeholder="Ex: prefere bolos de chocolate, gosta de decorações florais..." className="input resize-none" />
        </div>
        <div>
          <label className="label">Restrições Alimentares</label>
          <textarea name="restrictions" defaultValue={defaultValues.restrictions ?? ''} rows={2}
            placeholder="Ex: sem glúten, alergia a amendoim..." className="input resize-none" />
        </div>
        <div>
          <label className="label">Observações Internas</label>
          <textarea name="notes" defaultValue={defaultValues.notes ?? ''} rows={3}
            placeholder="Anotações da equipe sobre este cliente..." className="input resize-none" />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <SubmitButton label="Salvar Cliente" />
      </div>
    </form>
  )
}

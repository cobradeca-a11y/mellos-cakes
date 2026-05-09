'use client'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Conteúdo'}
    </button>
  )
}

interface Props {
  action: (fd: FormData) => Promise<void>
  campaigns: { id: string; name: string }[]
  defaultValues?: Record<string, any>
}

export function PostForm({ action, campaigns, defaultValues = {} }: Props) {
  return (
    <form action={action} className="card p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Canal *</label>
          <select name="channel" required className="input" defaultValue={defaultValues.channel ?? 'instagram'}>
            {['instagram','facebook','whatsapp','tiktok'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status *</label>
          <select name="status" required className="input" defaultValue={defaultValues.status ?? 'ideia'}>
            {['ideia','rascunho','aprovado','agendado','publicado'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Título *</label>
          <input name="title" required defaultValue={defaultValues.title} className="input" />
        </div>
        <div className="col-span-2">
          <label className="label">Legenda</label>
          <textarea name="caption" rows={4} defaultValue={defaultValues.caption ?? ''} placeholder="Escreva a legenda do post..." className="input resize-none" />
        </div>
        <div>
          <label className="label">CTA</label>
          <input name="cta" defaultValue={defaultValues.cta ?? ''} placeholder="Ex: Link na bio!" className="input" />
        </div>
        <div>
          <label className="label">Data de Agendamento</label>
          <input type="datetime-local" name="scheduled_at"
            defaultValue={defaultValues.scheduled_at ? new Date(defaultValues.scheduled_at).toISOString().slice(0,16) : ''}
            className="input" />
        </div>
        <div className="col-span-2">
          <label className="label">Hashtags</label>
          <input name="hashtags" defaultValue={defaultValues.hashtags ?? ''} placeholder="#confeitaria #bolo #cake" className="input" />
        </div>
        <div>
          <label className="label">Campanha</label>
          <select name="campaign_id" className="input" defaultValue={defaultValues.campaign_id ?? ''}>
            <option value="">Nenhuma</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Observações</label>
          <input name="notes" defaultValue={defaultValues.notes ?? ''} className="input" />
        </div>
      </div>
      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  )
}

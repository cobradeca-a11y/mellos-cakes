import { createClient } from '@/lib/supabase/server'
import { Settings } from 'lucide-react'
import { saveSettings } from './actions'

export const metadata = { title: 'Configurações' }

export default async function ConfiguracoesPage() {
  const supabase = createClient()
  const { data: settings } = await supabase.from('business_settings').select('*').limit(1).single()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
          <Settings className="w-5 h-5 text-brand-500" />
        </div>
        <h1 className="page-title">Configurações</h1>
      </div>

      <form action={saveSettings} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-[var(--text-1)]">Dados do Negócio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Nome da Empresa</label>
              <input name="name" defaultValue={settings?.name ?? 'MellosCakes'} className="input" />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input name="phone" defaultValue={settings?.phone ?? ''} className="input" />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input type="email" name="email" defaultValue={settings?.email ?? ''} className="input" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-[var(--text-1)]">Preferências Operacionais</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Moeda</label>
              <select name="currency" defaultValue={settings?.currency ?? 'BRL'} className="input">
                <option value="BRL">BRL — Real Brasileiro</option>
                <option value="USD">USD — Dólar</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
            <div>
              <label className="label">Markup Padrão (multiplicador)</label>
              <input type="number" step="0.1" min="1" name="default_markup"
                defaultValue={settings?.default_markup ?? '2.5'} className="input" />
              <p className="text-xs text-[var(--muted)] mt-1">Ex: 2.5 = 150% de margem sobre o custo</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">Salvar Configurações</button>
        </div>
      </form>
    </div>
  )
}

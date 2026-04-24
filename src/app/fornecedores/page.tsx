import { createClient } from '@/lib/supabase/server'
import { Plus, Building2, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Fornecedores' }

export default async function FornecedoresPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createClient()
  const q = searchParams.q ?? ''
  let query = supabase.from('suppliers').select('*', { count: 'exact' }).eq('active', true).order('name')
  if (q) query = query.ilike('name', `%${q}%`)
  const { data: suppliers, count } = await query

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fornecedores</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">{count ?? 0} cadastrados</p>
        </div>
        <Link href="/fornecedores/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Fornecedor
        </Link>
      </div>

      <div className="card p-4">
        <form className="flex gap-3">
          <input name="q" defaultValue={q} placeholder="Buscar fornecedor..." className="input flex-1" />
          <button type="submit" className="btn-primary">Buscar</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(suppliers ?? []).length === 0 ? (
          <div className="col-span-3 card p-12 text-center text-[var(--muted)]">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum fornecedor encontrado</p>
          </div>
        ) : (
          (suppliers ?? []).map((s: any) => (
            <div key={s.id} className="card-hover p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[var(--hover)] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[var(--text-3)]" />
                </div>
                <div className="flex gap-2">
                  <Link href={`/fornecedores/${s.id}`} className="btn-ghost text-xs py-1 px-2">Ver</Link>
                  <Link href={`/fornecedores/${s.id}/editar`} className="btn-ghost text-xs py-1 px-2">Editar</Link>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-1)]">{s.name}</h3>
                {s.contact_name && <p className="text-sm text-[var(--text-3)]">{s.contact_name}</p>}
              </div>
              <div className="space-y-1">
                {s.phone && (
                  <a href={`tel:${s.phone}`} className="flex items-center gap-2 text-sm text-[var(--text-3)] hover:text-brand-500">
                    <Phone className="w-3.5 h-3.5 text-[var(--muted)]" /> {s.phone}
                  </a>
                )}
                {s.email && (
                  <a href={`mailto:${s.email}`} className="flex items-center gap-2 text-sm text-[var(--text-3)] hover:text-brand-500">
                    <Mail className="w-3.5 h-3.5 text-[var(--muted)]" /> {s.email}
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

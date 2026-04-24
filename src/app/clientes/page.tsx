import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Users, Plus, Search, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { deleteCustomer } from './actions'

export const metadata = { title: 'Clientes' }

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const supabase = createClient()
  const q = searchParams.q ?? ''
  const page = Number(searchParams.page ?? 1)
  const pageSize = 20

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('active', true)
    .order('name', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (q) query = query.ilike('name', `%${q}%`)

  const { data: customers, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{count ?? 0} cadastrados</p>
        </div>
        <Link href="/clientes/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4">
        <form className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input name="q" defaultValue={q} placeholder="Buscar por nome, e-mail ou telefone..." className="input pl-9" />
          </div>
          <button type="submit" className="btn-primary">Buscar</button>
        </form>
      </div>

      {/* Table — desktop */}
      <div className="table-container hidden md:block">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Aniversário</th>
              <th>Cadastro</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum cliente encontrado</p>
                </td>
              </tr>
            ) : (
              (customers ?? []).map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">
                        {c.name.split(' ').slice(0,2).map((n: string) => n[0]).join('')}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                    </div>
                  </td>
                  <td>{c.phone ?? '—'}</td>
                  <td>{c.email ?? '—'}</td>
                  <td>{c.birthdate ? formatDate(c.birthdate) : '—'}</td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/clientes/${c.id}`} className="btn-ghost text-xs py-1 px-2">Ver</Link>
                      <Link href={`/clientes/${c.id}/editar`} className="btn-ghost text-xs py-1 px-2">Editar</Link>
                      <DeleteButton
                        action={deleteCustomer.bind(null, c.id)}
                        confirmMessage={`Excluir "${c.name}" permanentemente? Esta ação não pode ser desfeita.`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`?q=${q}&page=${page-1}`} className="btn-secondary text-xs">← Anterior</Link>}
              {page < totalPages && <Link href={`?q=${q}&page=${page+1}`} className="btn-secondary text-xs">Próxima →</Link>}
            </div>
          </div>
        )}
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {(customers ?? []).length === 0 ? (
          <div className="card p-10 text-center" style={{ color: 'var(--text-muted)' }}>
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum cliente encontrado</p>
          </div>
        ) : (
          (customers ?? []).map((c: any) => (
            <div key={c.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-sm font-bold shrink-0">
                    {c.name.split(' ').slice(0,2).map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                    {c.phone && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.phone}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Link href={`/clientes/${c.id}`} className="btn-ghost text-xs py-1 px-2">Ver</Link>
                  <DeleteButton
                    action={deleteCustomer.bind(null, c.id)}
                    confirmMessage={`Excluir "${c.name}"?`}
                  />
                </div>
              </div>
              {c.email && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Mail className="w-3.5 h-3.5" /> {c.email}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

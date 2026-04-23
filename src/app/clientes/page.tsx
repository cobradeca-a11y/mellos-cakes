import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Users, Plus, Search, Phone, Mail, Calendar } from 'lucide-react'
import Link from 'next/link'

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

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data: customers, count } = await query

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{count ?? 0} cadastrados</p>
        </div>
        <Link href="/clientes/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4">
        <form className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome, e-mail ou telefone..."
              className="input pl-9"
            />
          </div>
          <button type="submit" className="btn-primary">Buscar</button>
        </form>
      </div>

      {/* Table */}
      <div className="table-container">
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
                <td colSpan={6} className="text-center py-12 text-neutral-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum cliente encontrado</p>
                </td>
              </tr>
            ) : (
              (customers ?? []).map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">
                        {c.name.split(' ').slice(0,2).map((n: string) => n[0]).join('')}
                      </div>
                      <span className="font-medium text-neutral-900">{c.name}</span>
                    </div>
                  </td>
                  <td>
                    {c.phone ? (
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-neutral-600 hover:text-brand-500">
                        <Phone className="w-3.5 h-3.5" /> {c.phone}
                      </a>
                    ) : '—'}
                  </td>
                  <td>
                    {c.email ? (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-neutral-600 hover:text-brand-500">
                        <Mail className="w-3.5 h-3.5" /> {c.email}
                      </a>
                    ) : '—'}
                  </td>
                  <td>
                    {c.birthdate ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        {formatDate(c.birthdate)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="text-neutral-400 text-xs">{formatDate(c.created_at)}</td>
                  <td>
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/clientes/${c.id}`} className="btn-ghost text-xs py-1 px-2">
                        Ver
                      </Link>
                      <Link href={`/clientes/${c.id}/editar`} className="btn-ghost text-xs py-1 px-2">
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
            <p className="text-sm text-neutral-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?q=${q}&page=${page - 1}`} className="btn-secondary text-xs py-1.5 px-3">
                  ← Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link href={`?q=${q}&page=${page + 1}`} className="btn-secondary text-xs py-1.5 px-3">
                  Próxima →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

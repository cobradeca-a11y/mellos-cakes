import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Plus, ShoppingBag, Star } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Produtos' }

export default async function ProdutosPage({ searchParams }: { searchParams: { q?: string; categoria?: string } }) {
  const supabase = createClient()
  const q = searchParams.q ?? ''
  const cat = searchParams.categoria ?? ''

  const [productsQuery, categoriesQuery] = await Promise.all([
    (() => {
      let query = supabase
        .from('products')
        .select('*, product_categories(name)', { count: 'exact' })
        .eq('active', true)
        .order('name')
      if (q) query = query.ilike('name', `%${q}%`)
      if (cat) query = query.eq('category_id', cat)
      return query
    })(),
    supabase.from('product_categories').select('id, name').eq('active', true).order('name'),
  ])

  const { data: products, count } = productsQuery
  const { data: categories } = categoriesQuery

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Catálogo de Produtos</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">{count ?? 0} produtos</p>
        </div>
        <Link href="/produtos/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Produto
        </Link>
      </div>

      <div className="card p-4">
        <form className="flex flex-wrap gap-3">
          <input name="q" defaultValue={q} placeholder="Buscar produto..." className="input flex-1 min-w-48" />
          <select name="categoria" defaultValue={cat} className="input w-auto min-w-40">
            <option value="">Todas as Categorias</option>
            {(categories ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="btn-primary">Filtrar</button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(products ?? []).length === 0 ? (
          <div className="col-span-4 card p-12 text-center text-[var(--muted)]">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum produto encontrado</p>
          </div>
        ) : (
          (products ?? []).map((p: any) => (
            <Link key={p.id} href={`/produtos/${p.id}`} className="card-hover block overflow-hidden group">
              <div className="aspect-square bg-gradient-to-br from-brand-50 to-rose-50 flex items-center justify-center relative">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-12 h-12 text-brand-300" />
                )}
                {p.featured && (
                  <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Destaque
                  </span>
                )}
                {!p.available && (
                  <div className="absolute inset-0 bg-[var(--bg-card)]/60 flex items-center justify-center">
                    <span className="badge-red">Indisponível</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-[var(--muted)] mb-1">{(p.product_categories as any)?.name ?? '—'}</p>
                <h3 className="font-semibold text-[var(--text-1)] group-hover:text-brand-500 transition-colors">{p.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-bold text-brand-500">{formatCurrency(p.base_price)}</p>
                  <p className="text-xs text-[var(--muted)]">{p.min_production_days}d preparo</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

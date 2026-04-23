import { createClient } from '@/lib/supabase/server'
import { createProduct } from '../actions'
import { ProductForm } from '../ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Novo Produto' }

export default async function NovoProdutoPage() {
  const supabase = createClient()
  const { data: categories } = await supabase.from('product_categories').select('id, name').eq('active', true).order('name')
  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/produtos" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Novo Produto</h1>
      </div>
      <ProductForm action={createProduct} categories={categories ?? []} />
    </div>
  )
}

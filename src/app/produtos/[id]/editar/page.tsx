import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateProduct } from '../../actions'
import { ProductForm } from '../../ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditarProdutoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('product_categories').select('id,name').eq('active', true).order('name'),
  ])
  if (!product) notFound()
  const action = updateProduct.bind(null, params.id)
  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/produtos/${params.id}`} className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Editar Produto</h1>
      </div>
      <ProductForm action={action} categories={categories ?? []} defaultValues={product} />
    </div>
  )
}

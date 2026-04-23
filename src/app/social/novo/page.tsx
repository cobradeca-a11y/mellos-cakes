import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createPost } from '../actions'
import { PostForm } from '../PostForm'

export const metadata = { title: 'Novo Conteúdo' }

export default async function NovoPostPage() {
  const supabase = createClient()
  const { data: campaigns } = await supabase.from('content_campaigns').select('id,name').eq('active', true).order('name')
  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/social" className="btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Novo Conteúdo</h1>
      </div>
      <PostForm action={createPost} campaigns={campaigns ?? []} />
    </div>
  )
}

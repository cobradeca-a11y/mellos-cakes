import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Plus, Instagram, Facebook, MessageCircle, Music2, Calendar } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Redes Sociais' }

const channelIcon: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  whatsapp: MessageCircle,
  tiktok: Music2,
}

const statusBadge: Record<string, string> = {
  ideia: 'badge-gray',
  rascunho: 'badge-yellow',
  aprovado: 'badge-blue',
  agendado: 'badge bg-purple-100 text-purple-700',
  publicado: 'badge-green',
}

const STATUS_OPTS = ['','ideia','rascunho','aprovado','agendado','publicado']
const CHANNEL_OPTS = ['','instagram','facebook','whatsapp','tiktok']

export default async function SocialPage({
  searchParams,
}: {
  searchParams: { status?: string; canal?: string }
}) {
  const supabase = createClient()
  const status = searchParams.status ?? ''
  const canal = searchParams.canal ?? ''

  let query = supabase
    .from('content_posts')
    .select('*', { count: 'exact' })
    .order('scheduled_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (canal) query = query.eq('channel', canal)

  const { data: posts, count } = await query

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Redes Sociais</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">{count ?? 0} conteúdos</p>
        </div>
        <Link href="/social/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Conteúdo
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form className="flex flex-wrap gap-3">
          <select name="status" defaultValue={status} className="input w-auto">
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s || 'Todos os Status'}</option>)}
          </select>
          <select name="canal" defaultValue={canal} className="input w-auto">
            {CHANNEL_OPTS.map(c => <option key={c} value={c}>{c || 'Todos os Canais'}</option>)}
          </select>
          <button type="submit" className="btn-primary">Filtrar</button>
        </form>
      </div>

      {/* Kanban-ish grid by status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(posts ?? []).length === 0 ? (
          <div className="col-span-3 card p-12 text-center text-[var(--muted)]">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum conteúdo encontrado</p>
          </div>
        ) : (
          (posts ?? []).map((post: any) => {
            const Icon = channelIcon[post.channel] ?? Calendar
            return (
              <Link key={post.id} href={`/social/${post.id}`}
                className="card-hover p-4 block space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--hover)] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[var(--text-3)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-2)] capitalize">{post.channel}</span>
                  </div>
                  <span className={statusBadge[post.status] ?? 'badge-gray'}>{post.status}</span>
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-1)] line-clamp-1">{post.title}</p>
                  {post.caption && <p className="text-sm text-[var(--text-3)] mt-1 line-clamp-2">{post.caption}</p>}
                </div>
                {post.scheduled_at && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(post.scheduled_at)}
                  </div>
                )}
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

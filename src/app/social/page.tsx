import { SocialTabs } from './SocialTabs'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Redes Sociais' }

export default async function SocialPage() {
  const supabase = createClient()

  const [{ data: posts }, { data: campaigns }, { data: templates }] = await Promise.all([
    supabase.from('content_posts').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('content_campaigns').select('*').order('created_at', { ascending: false }),
    supabase.from('whatsapp_templates').select('*').order('name'),
  ])

  return (
    <SocialTabs
      posts={posts ?? []}
      campaigns={campaigns ?? []}
      templates={templates ?? []}
    />
  )
}

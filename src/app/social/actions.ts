'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'

export async function createPost(formData: FormData) {
  const supabase = createClient()
  const data = {
    business_id: BUSINESS_ID,
    title: formData.get('title') as string,
    caption: formData.get('caption') as string || null,
    hashtags: formData.get('hashtags') as string || null,
    cta: formData.get('cta') as string || null,
    channel: formData.get('channel') as string,
    status: formData.get('status') as string,
    scheduled_at: formData.get('scheduled_at') as string || null,
    notes: formData.get('notes') as string || null,
    campaign_id: formData.get('campaign_id') as string || null,
  }
  const { error } = await supabase.from('content_posts').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/social')
  redirect('/social')
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = createClient()
  const data = {
    title: formData.get('title') as string,
    caption: formData.get('caption') as string || null,
    hashtags: formData.get('hashtags') as string || null,
    cta: formData.get('cta') as string || null,
    channel: formData.get('channel') as string,
    status: formData.get('status') as string,
    scheduled_at: formData.get('scheduled_at') as string || null,
    notes: formData.get('notes') as string || null,
    campaign_id: formData.get('campaign_id') as string || null,
  }
  const { error } = await supabase.from('content_posts').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/social')
  redirect('/social')
}

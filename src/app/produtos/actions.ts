'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'
const PRODUCT_IMAGES_BUCKET = 'products'

function getProductPayload(formData: FormData) {
  return {
    business_id: BUSINESS_ID,
    name: (formData.get('name') as string)?.trim(),
    category_id: (formData.get('category_id') as string) || null,
    description: ((formData.get('description') as string) || '').trim() || null,
    base_price: Number(formData.get('base_price') ?? 0),
    min_production_days: Number(formData.get('min_production_days') ?? 3),
    available: formData.get('available') === 'true',
    featured: formData.get('featured') === 'true',
  }
}

function getImageFile(formData: FormData) {
  const image = formData.get('image')
  if (!(image instanceof File) || image.size === 0) return null
  if (!image.type.startsWith('image/')) throw new Error('O arquivo enviado precisa ser uma imagem.')
  return image
}

function sanitizeFileName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

function getStoragePathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length))
}

async function deleteProductImages(supabase: ReturnType<typeof createClient>, images: string[] = []) {
  const paths = images
    .map(getStoragePathFromPublicUrl)
    .filter((path): path is string => Boolean(path))

  if (paths.length > 0) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths)
  }
}

async function uploadProductImage(supabase: ReturnType<typeof createClient>, productId: string, image: File) {
  const path = `${productId}/${Date.now()}-${sanitizeFileName(image.name)}`
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, image, {
    contentType: image.type,
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function createProduct(formData: FormData) {
  const supabase = createClient()
  const image = getImageFile(formData)

  const { data: product, error } = await supabase
    .from('products')
    .insert({ ...getProductPayload(formData), images: [] })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (image) {
    const publicUrl = await uploadProductImage(supabase, product.id, image)
    const { error: updateError } = await supabase
      .from('products')
      .update({ images: [publicUrl] })
      .eq('id', product.id)

    if (updateError) throw new Error(updateError.message)
  }

  revalidatePath('/produtos')
  redirect(`/produtos/${product.id}`)
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createClient()
  const image = getImageFile(formData)
  const removeImage = formData.get('remove_image') === 'true'

  const { data: currentProduct, error: currentError } = await supabase
    .from('products')
    .select('images')
    .eq('id', id)
    .single()

  if (currentError) throw new Error(currentError.message)

  let images = currentProduct?.images ?? []

  if (image || removeImage) {
    await deleteProductImages(supabase, images)
    images = []
  }

  if (image) {
    const publicUrl = await uploadProductImage(supabase, id, image)
    images = [publicUrl]
  }

  const { error } = await supabase
    .from('products')
    .update({ ...getProductPayload(formData), images })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/produtos')
  revalidatePath(`/produtos/${id}`)
  redirect(`/produtos/${id}`)
}

export async function deleteProduct(id: string) {
  const supabase = createClient()

  const { data: product, error: readError } = await supabase
    .from('products')
    .select('images')
    .eq('id', id)
    .single()

  if (readError) throw new Error(readError.message)

  await deleteProductImages(supabase, product?.images ?? [])

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/produtos')
  redirect('/produtos')
}

'use client'

import { useFormStatus } from 'react-dom'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Produto'}
    </button>
  )
}

interface Props {
  action: (fd: FormData) => Promise<void>
  categories: { id: string; name: string }[]
  defaultValues?: Record<string, any>
}

export function ProductForm({ action, categories, defaultValues = {} }: Props) {
  const currentImage = Array.isArray(defaultValues.images) ? defaultValues.images[0] : undefined

  return (
    <form action={action} className="space-y-5">
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Informações do Produto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Nome *</label>
            <input name="name" required defaultValue={defaultValues.name} className="input" />
          </div>
          <div>
            <label className="label">Categoria</label>
            <select name="category_id" className="input" defaultValue={defaultValues.category_id ?? ''}>
              <option value="">Sem categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Prazo Mínimo (dias) *</label>
            <input type="number" min="1" name="min_production_days" required
              defaultValue={defaultValues.min_production_days ?? '3'} className="input" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Descrição</label>
            <textarea name="description" rows={3} defaultValue={defaultValues.description ?? ''} className="input resize-none" />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Foto do Produto</h3>
        <div className="grid grid-cols-1 md:grid-cols-[128px_1fr] gap-4 items-start">
          <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-brand-50 to-rose-50 flex items-center justify-center overflow-hidden border border-[var(--border-light)]">
            {currentImage ? (
              <img src={currentImage} alt={defaultValues.name ?? 'Foto do produto'} className="w-full h-full object-cover" />
            ) : (
              <ImagePlus className="w-10 h-10 text-brand-300" />
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Enviar nova foto</label>
              <input
                type="file"
                name="image"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="input file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600"
              />
              <p className="mt-1 text-xs text-[var(--text-3)]">
                Ao salvar, a nova foto substitui a foto atual do produto.
              </p>
            </div>

            {currentImage && (
              <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-red-200/70 bg-red-50/60 p-3 dark:border-red-900/40 dark:bg-red-950/20">
                <input type="checkbox" name="remove_image" value="true" className="w-4 h-4 accent-red-500" />
                <span className="text-sm font-medium text-red-600 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Remover foto atual
                </span>
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-[var(--text-1)]">Preço & Disponibilidade</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Preço Base (R$) *</label>
            <input type="number" step="0.01" min="0" name="base_price" required
              defaultValue={defaultValues.base_price ?? ''} className="input" />
          </div>
          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="hidden" name="available" value="false" />
              <input type="checkbox" name="available" value="true"
                defaultChecked={defaultValues.available !== false}
                className="w-4 h-4 accent-brand-500" />
              <span className="text-sm font-medium text-[var(--text-2)]">Disponível para venda</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="hidden" name="featured" value="false" />
              <input type="checkbox" name="featured" value="true"
                defaultChecked={defaultValues.featured === true}
                className="w-4 h-4 accent-brand-500" />
              <span className="text-sm font-medium text-[var(--text-2)]">Destaque no catálogo</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  )
}

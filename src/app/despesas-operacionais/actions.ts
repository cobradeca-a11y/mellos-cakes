'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BUSINESS_ID = '1d8de479-7996-4868-b2d1-c277b5a7fb73'
const EXPENSES_PATH = '/despesas-operacionais'
const STOCK_BLOCK_START = '--- DADOS DE ESTOQUE ---'
const STOCK_BLOCK_END = '--- FIM DADOS DE ESTOQUE ---'

function cleanText(value: FormDataEntryValue | null) {
  return ((value as string) || '').trim()
}

function removeStockBlock(notes: string) {
  const start = notes.indexOf(STOCK_BLOCK_START)
  const end = notes.indexOf(STOCK_BLOCK_END)

  if (start === -1 || end === -1 || end < start) return notes.trim()

  return `${notes.slice(0, start)}${notes.slice(end + STOCK_BLOCK_END.length)}`.trim()
}

function buildNotes(formData: FormData) {
  const baseNotes = removeStockBlock(cleanText(formData.get('notes')))
  const stockFields = [
    ['Item de estoque', cleanText(formData.get('stock_item'))],
    ['Unidade', cleanText(formData.get('stock_unit'))],
    ['Quantidade', cleanText(formData.get('stock_quantity'))],
    ['Validade', cleanText(formData.get('stock_expiry_date'))],
    ['Fornecedor', cleanText(formData.get('supplier_name'))],
  ].filter(([, value]) => value)

  if (stockFields.length === 0) return baseNotes || null

  const stockBlock = [
    STOCK_BLOCK_START,
    ...stockFields.map(([label, value]) => `${label}: ${value}`),
    STOCK_BLOCK_END,
  ].join('\n')

  return [baseNotes, stockBlock].filter(Boolean).join('\n\n')
}

function getPayload(formData: FormData) {
  const date = formData.get('date') as string

  return {
    business_id: BUSINESS_ID,
    type: 'despesa',
    category: formData.get('category') as string,
    description: cleanText(formData.get('description')),
    amount: Number(formData.get('amount') ?? 0),
    date,
    payment_method: (formData.get('payment_method') as string) || null,
    paid: formData.get('paid') === 'true',
    notes: buildNotes(formData),
  }
}

function getMonthFromDate(date: string) {
  return date?.slice(0, 7) || new Date().toISOString().slice(0, 7)
}

export async function createOperationalExpense(formData: FormData) {
  const supabase = createClient()
  const payload = getPayload(formData)
  const { error } = await supabase.from('cashflow_entries').insert(payload)
  if (error) throw new Error(error.message)

  revalidatePath(EXPENSES_PATH)
  revalidatePath('/financeiro')
  redirect(`${EXPENSES_PATH}?mes=${getMonthFromDate(payload.date)}`)
}

export async function updateOperationalExpense(id: string, formData: FormData) {
  const supabase = createClient()
  const payload = getPayload(formData)
  const { error } = await supabase
    .from('cashflow_entries')
    .update(payload)
    .eq('id', id)
    .eq('type', 'despesa')

  if (error) throw new Error(error.message)

  revalidatePath(EXPENSES_PATH)
  revalidatePath('/financeiro')
  redirect(`${EXPENSES_PATH}?mes=${getMonthFromDate(payload.date)}`)
}

export async function deleteOperationalExpense(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('cashflow_entries')
    .delete()
    .eq('id', id)
    .eq('type', 'despesa')

  if (error) throw new Error(error.message)

  revalidatePath(EXPENSES_PATH)
  revalidatePath('/financeiro')
}

import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { CalendarDays, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Produção' }

export default async function ProducaoPage({ searchParams }: { searchParams: { data?: string } }) {
  const supabase = createClient()
  const hoje = searchParams.data ?? new Date().toISOString().split('T')[0]

  const startOfWeek = new Date(hoje)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)

  const { data: tasks } = await supabase
    .from('production_tasks')
    .select('*, orders(order_number, delivery_date, customers(name))')
    .gte('scheduled_date', startOfWeek.toISOString().split('T')[0])
    .lte('scheduled_date', endOfWeek.toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })
    .order('priority', { ascending: false })

  // Group by date
  const byDate: Record<string, typeof tasks> = {}
  for (const task of tasks ?? []) {
    const d = task.scheduled_date ?? 'sem_data'
    if (!byDate[d]) byDate[d] = []
    byDate[d]!.push(task)
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const weekLabel = `${formatDate(startOfWeek.toISOString())} – ${formatDate(endOfWeek.toISOString())}`
  const totalTasks = tasks?.length ?? 0
  const doneTasks = tasks?.filter(t => t.completed).length ?? 0

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda de Produção</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">{weekLabel} • {doneTasks}/{totalTasks} tarefas</p>
        </div>
      </div>

      {/* Week nav */}
      <div className="card p-4 flex items-center justify-between">
        <form className="flex items-center gap-3">
          <input type="date" name="data" defaultValue={hoje} className="input w-auto" />
          <button type="submit" className="btn-secondary text-sm">Ir para semana</button>
        </form>
        <div className="text-sm text-[var(--text-3)]">
          {totalTasks > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
                />
              </div>
              <span>{Math.round((doneTasks / totalTasks) * 100)}% concluído</span>
            </div>
          )}
        </div>
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-7 gap-3">
        {days.map(day => {
          const dayTasks = byDate[day] ?? []
          const isToday = day === new Date().toISOString().split('T')[0]
          const d = new Date(day + 'T12:00:00')
          return (
            <div key={day} className={`space-y-2 ${isToday ? '' : ''}`}>
              <div className={`text-center py-2 rounded-xl text-sm font-medium ${isToday ? 'bg-brand-500 text-white' : 'bg-[var(--hover)] text-[var(--text-3)]'}`}>
                <p className="text-xs opacity-70">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                <p className="font-bold">{d.getDate()}</p>
              </div>
              <div className="space-y-1.5 min-h-24">
                {dayTasks.map((task: any) => (
                  <div key={task.id} className={`p-2 rounded-lg text-xs border ${task.completed ? 'bg-green-50 border-green-200 opacity-60' : 'bg-[var(--bg-card)] border-[var(--border)]'}`}>
                    <div className="flex items-start gap-1.5">
                      {task.completed
                        ? <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                        : <Clock className="w-3 h-3 text-[var(--muted)] mt-0.5 shrink-0" />
                      }
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text-1)] truncate">{task.title}</p>
                        <p className="text-[var(--muted)] truncate">{task.orders?.customers?.name}</p>
                        {task.orders?.order_number && (
                          <Link href={`/pedidos/${task.order_id}`} className="text-brand-500 hover:underline">
                            #{task.orders.order_number}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {dayTasks.length === 0 && (
                  <div className="text-center py-4 text-xs text-neutral-300">—</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* All tasks list */}
      <div className="table-container">
        <div className="px-5 py-4 border-b border-[var(--border-light)]">
          <h3 className="font-semibold text-[var(--text-1)]">Tarefas da Semana</h3>
        </div>
        <table className="table">
          <thead>
            <tr><th>Data</th><th>Tarefa</th><th>Pedido</th><th>Cliente</th><th>Prioridade</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {(tasks ?? []).length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-[var(--muted)]">Nenhuma tarefa esta semana</td></tr>
            ) : (
              (tasks ?? []).map((task: any) => (
                <tr key={task.id} className={task.completed ? 'opacity-50' : ''}>
                  <td>{task.scheduled_date ? formatDate(task.scheduled_date) : '—'}</td>
                  <td className="font-medium text-[var(--text-1)]">{task.title}</td>
                  <td>
                    {task.orders?.order_number
                      ? <Link href={`/pedidos/${task.order_id}`} className="text-brand-500 hover:underline font-mono text-sm">#{task.orders.order_number}</Link>
                      : '—'}
                  </td>
                  <td>{task.orders?.customers?.name ?? '—'}</td>
                  <td>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < task.priority ? 'text-yellow-400' : 'text-neutral-200'}>★</span>
                    ))}
                  </td>
                  <td>
                    <span className={task.completed ? 'badge-green' : 'badge-yellow'}>
                      {task.completed ? 'Concluído' : 'Pendente'}
                    </span>
                  </td>
                  <td>
                    {!task.completed && (
                      <TaskCompleteButton taskId={task.id} />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TaskCompleteButton({ taskId }: { taskId: string }) {
  async function completeTask() {
    'use server'
    const { createClient } = await import('@/lib/supabase/server')
    const { revalidatePath } = await import('next/cache')
    const supabase = createClient()
    await supabase.from('production_tasks').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', taskId)
    revalidatePath('/producao')
  }
  return (
    <form action={completeTask}>
      <button type="submit" className="btn-ghost text-xs py-1 px-2 text-green-600">
        ✓ Concluir
      </button>
    </form>
  )
}

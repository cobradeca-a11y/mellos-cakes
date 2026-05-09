'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
<<<<<<< HEAD
  LayoutDashboard, Users, ShoppingBag, Package, FlaskConical,
  ClipboardList, ShoppingCart, Truck, CalendarDays, DollarSign,
  Megaphone, Settings, ChevronDown, Cookie, AlertTriangle,
  FileText, BookOpen, Building2, Bell
} from 'lucide-react'
import { useState } from 'react'
=======
  LayoutDashboard, BarChart2, Users, ShoppingBag, Cookie, BookOpen,
  ClipboardList, ShoppingCart, Truck, CalendarDays, DollarSign,
  Megaphone, Settings, FileText, Building2, Package, X, Menu
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0

const navGroups = [
  {
    label: null,
<<<<<<< HEAD
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
=======
    items: [{ href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
  },
  {
    label: 'Clientes & Vendas',
    items: [
      { href: '/clientes', icon: Users, label: 'Clientes' },
      { href: '/orcamentos', icon: FileText, label: 'Orçamentos' },
      { href: '/pedidos', icon: ClipboardList, label: 'Pedidos' },
      { href: '/entregas', icon: Truck, label: 'Entregas' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/produtos', icon: ShoppingBag, label: 'Produtos' },
      { href: '/receitas', icon: BookOpen, label: 'Receitas' },
    ],
  },
  {
    label: 'Operação',
    items: [
      { href: '/producao', icon: CalendarDays, label: 'Produção' },
      { href: '/ingredientes', icon: Cookie, label: 'Ingredientes' },
      { href: '/estoque', icon: Package, label: 'Estoque' },
    ],
  },
  {
    label: 'Compras',
    items: [
      { href: '/fornecedores', icon: Building2, label: 'Fornecedores' },
      { href: '/compras', icon: ShoppingCart, label: 'Compras' },
    ],
  },
  {
    label: 'Financeiro',
<<<<<<< HEAD
    items: [
      { href: '/financeiro', icon: DollarSign, label: 'Financeiro' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/social', icon: Megaphone, label: 'Redes Sociais' },
    ],
=======
    items: [{ href: '/financeiro', icon: DollarSign, label: 'Financeiro' }],
  },
  {
    label: 'Marketing',
    items: [{ href: '/social', icon: Megaphone, label: 'Redes Sociais' }],
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
  },
  {
    label: null,
    items: [
<<<<<<< HEAD
=======
      { href: '/relatorios', icon: BarChart2, label: 'Relatórios' },
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
      { href: '/configuracoes', icon: Settings, label: 'Configurações' },
    ],
  },
]

<<<<<<< HEAD
export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-neutral-100"
      style={{ width: 'var(--sidebar-w)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-neutral-100">
        <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm">
          <Cookie className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-display font-semibold text-neutral-900 text-base leading-none">
            Mellos
          </span>
          <span className="font-display font-semibold text-brand-500 text-base leading-none">
            Cakes
          </span>
          <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider">Gestão</p>
        </div>
=======
function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm">
            <Cookie className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Mellos</span>
            <span className="font-display font-semibold text-base text-brand-500">Cakes</span>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Gestão</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--hover)] md:hidden">
            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && 'mt-4')}>
            {group.label && (
<<<<<<< HEAD
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
=======
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
<<<<<<< HEAD
=======
                  onClick={onClose}
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 mb-0.5',
                    active
                      ? 'bg-brand-500 text-white shadow-sm'
<<<<<<< HEAD
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
=======
                      : 'hover:bg-[var(--hover)]'
                  )}
                  style={{ color: active ? 'white' : 'var(--text-secondary)' }}
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
<<<<<<< HEAD
      <div className="px-3 py-4 border-t border-neutral-100">
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">
            M
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">MellosCakes</p>
            <p className="text-xs text-neutral-400">Admin</p>
          </div>
        </Link>
      </div>
    </aside>
=======
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">M</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>MellosCakes</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Admin</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl shadow-md"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-72 transition-transform duration-300',
        )}
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <NavContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 z-40 flex-col"
        style={{
          width: 'var(--sidebar-w)',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <NavContent />
      </aside>
    </>
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
  )
}

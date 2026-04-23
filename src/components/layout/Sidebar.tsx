'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, ShoppingBag, Package, FlaskConical,
  ClipboardList, ShoppingCart, Truck, CalendarDays, DollarSign,
  Megaphone, Settings, ChevronDown, Cookie, AlertTriangle,
  FileText, BookOpen, Building2, Bell
} from 'lucide-react'
import { useState } from 'react'

const navGroups = [
  {
    label: null,
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
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
    items: [
      { href: '/financeiro', icon: DollarSign, label: 'Financeiro' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/social', icon: Megaphone, label: 'Redes Sociais' },
    ],
  },
  {
    label: null,
    items: [
      { href: '/configuracoes', icon: Settings, label: 'Configurações' },
    ],
  },
]

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
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && 'mt-4')}>
            {group.label && (
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 mb-0.5',
                    active
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
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
  )
}

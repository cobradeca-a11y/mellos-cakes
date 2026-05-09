'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved === 'dark' || (!saved && prefersDark)
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-lg hover:bg-[var(--hover)] transition-colors"
      title={dark ? 'Modo claro' : 'Modo escuro'}
    >
      {dark
        ? <Sun className="w-4 h-4 text-yellow-400" />
        : <Moon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
      }
    </button>
  )
}

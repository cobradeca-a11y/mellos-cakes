import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-neutral-50">
=======
    <div className="min-h-screen bg-[var(--hover)]">
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-w)' }}>
        <Topbar />
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}

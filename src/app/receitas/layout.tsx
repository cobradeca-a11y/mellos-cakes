import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-w)' }}>
        <Topbar />
        <main className="p-6 animate-fade-in">
=======
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="md:ml-[260px] transition-all">
        <Topbar />
        <main className="p-4 md:p-6 animate-fade-in">
>>>>>>> d3a4002f570254ccbd9fca20bb1eb22501a65fb0
          {children}
        </main>
      </div>
    </div>
  )
}

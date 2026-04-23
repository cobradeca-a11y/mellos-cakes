import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
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

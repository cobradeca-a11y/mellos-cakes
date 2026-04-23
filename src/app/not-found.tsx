import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-8xl font-display font-bold text-brand-500">404</p>
        <h1 className="text-2xl font-display font-semibold text-neutral-900 mt-4">Página não encontrada</h1>
        <p className="text-neutral-500 mt-2">O recurso que você procura não existe ou foi removido.</p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}

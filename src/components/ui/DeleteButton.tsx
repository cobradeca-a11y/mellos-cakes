'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'

interface Props {
  action: () => Promise<void>
  label?: string
  confirmMessage?: string
}

export function DeleteButton({
  action,
  label = 'Excluir',
  confirmMessage = 'Tem certeza que deseja excluir? Esta ação não pode ser desfeita.',
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await action()
    } catch (e) {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-ghost text-xs py-1 px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        title="Excluir"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
              Confirmar exclusão
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
              {confirmMessage}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="btn-secondary flex-1 justify-center"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="btn-danger flex-1 justify-center"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Excluindo...</>
                  : <><Trash2 className="w-4 h-4" /> Excluir</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

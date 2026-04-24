'use client'

export function PrintStyles() {
  return (
    <style>{`
      @media print {
        /* Força modo claro — sobrescreve .dark sem tocar no DOM */
        html, html.dark,
        html *, html.dark * {
          color-scheme: light !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Remove layout do app */
        aside, nav, header, .no-print { display: none !important; }
        body  { margin: 0 !important; padding: 0 !important; background: #ffffff !important; font-family: Arial, sans-serif !important; }
        main  { margin: 0 !important; padding: 0 !important; }

        /* Sobrescreve variáveis CSS do dark mode — declarar em cada seletor possível */
        html, html.dark, :root, body {
          --bg:           #fafaf9 !important;
          --bg-card:      #ffffff !important;
          --border:       #e7e5e4 !important;
          --border-light: #f5f5f4 !important;
          --text-1:       #1c1917 !important;
          --text-2:       #44403c !important;
          --text-3:       #78716c !important;
          --muted:        #a8a29e !important;
          --hover:        #f5f5f4 !important;
          --brand:        #e55c28 !important;
        }

        /* Cards */
        .card, .card-hover, .table-container {
          background: #ffffff !important;
          border: 1px solid #e7e5e4 !important;
          box-shadow: none !important;
        }

        /* Tabelas */
        .table thead       { background: #f5f5f4 !important; border-bottom: 1px solid #e7e5e4 !important; }
        .table th          { color: #a8a29e !important; }
        .table td          { color: #44403c !important; border-bottom-color: #f5f5f4 !important; }
        .table tbody tr    { background: transparent !important; }

        /* Badges — modo claro forçado */
        .badge-green  { background: #dcfce7 !important; color: #15803d !important; }
        .badge-yellow { background: #fef9c3 !important; color: #a16207 !important; }
        .badge-red    { background: #fee2e2 !important; color: #dc2626 !important; }
        .badge-blue   { background: #dbeafe !important; color: #1d4ed8 !important; }
        .badge-gray   { background: #f5f5f4 !important; color: #78716c !important; }

        /* Inputs */
        input, select {
          background: #f5f5f4 !important;
          color: #1c1917 !important;
          border: 1px solid #e7e5e4 !important;
        }

        /* Página A4 */
        @page { size: A4 portrait; margin: 1.5cm; }
      }
    `}</style>
  )
}

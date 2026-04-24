'use client'

export function PrintStyles() {
  return (
    <style>{`
      @media print {
        /* Força modo claro absoluto */
        *, *::before, *::after {
          color-scheme: light only !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Remove sidebar, topbar, abas, botões */
        aside, nav, header,
        .no-print,
        [data-sidebar],
        [data-topbar] {
          display: none !important;
        }

        /* Reset do layout */
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #1c1917 !important;
          font-family: Arial, sans-serif !important;
        }

        main {
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Variáveis CSS — forçar valores claros */
        :root, html, html.dark, .dark {
          --bg:          #fafaf9 !important;
          --bg-card:     #ffffff !important;
          --bg-sidebar:  #ffffff !important;
          --border:      #e7e5e4 !important;
          --border-light:#f5f5f4 !important;
          --text-1:      #1c1917 !important;
          --text-2:      #44403c !important;
          --text-3:      #78716c !important;
          --muted:       #a8a29e !important;
          --hover:       #f5f5f4 !important;
          --brand:       #e55c28 !important;
        }

        /* Cards */
        .card, [class*="card"] {
          background: #ffffff !important;
          border: 1px solid #e7e5e4 !important;
          border-radius: 12px !important;
          break-inside: avoid !important;
          box-shadow: none !important;
        }

        /* Tabelas */
        .table thead {
          background: #f5f5f4 !important;
        }
        .table th {
          color: #a8a29e !important;
        }
        .table td {
          color: #44403c !important;
          border-bottom-color: #f5f5f4 !important;
        }
        .table tbody tr:hover {
          background: transparent !important;
        }

        /* Badges */
        .badge-green  { background: #dcfce7 !important; color: #15803d !important; }
        .badge-yellow { background: #fef9c3 !important; color: #a16207 !important; }
        .badge-red    { background: #fee2e2 !important; color: #dc2626 !important; }
        .badge-blue   { background: #dbeafe !important; color: #1d4ed8 !important; }
        .badge-gray   { background: #f5f5f4 !important; color: #78716c !important; }

        /* Página */
        @page {
          size: A4 portrait;
          margin: 1.5cm 1.5cm 1.5cm 1.5cm;
        }

        /* Cabeçalho de impressão */
        .print-header {
          display: block !important;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e55c28;
        }

        /* Inputs e selects viram texto */
        input, select {
          border: 1px solid #e7e5e4 !important;
          background: #f5f5f4 !important;
          color: #1c1917 !important;
        }
      }
    `}</style>
  )
}

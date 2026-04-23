import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf4f0',
          100: '#fbe6da',
          200: '#f7ccb5',
          300: '#f2a882',
          400: '#eb7a4a',
          500: '#e55c28',
          600: '#d4431b',
          700: '#b03317',
          800: '#8d2b19',
          900: '#722618',
          950: '#3d100a',
        },
        rose: {
          50:  '#fff1f3',
          100: '#ffe1e6',
          200: '#ffc8d2',
          300: '#ffa0b3',
          400: '#ff6b8a',
          500: '#f83d65',
          600: '#e51d4a',
          700: '#c21140',
          800: '#a2133c',
          900: '#8b1439',
          950: '#4e051b',
        },
        neutral: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        'modal': '0 20px 60px -10px rgb(0 0 0 / 0.25)',
      },
      borderRadius: {
        '4': '1rem',
        '5': '1.25rem',
      },
    },
  },
  plugins: [],
}

export default config

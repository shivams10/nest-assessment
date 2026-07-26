import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: 'var(--brand)',
          hover:   'var(--brand-hover)',
          active:  'var(--brand-active)',
          light:   'var(--brand-light)',
          border:  'var(--brand-border)',
          text:    'var(--brand-text)',
        },
        surface: {
          base:    'var(--bg-base)',
          DEFAULT: 'var(--bg-surface)',
          subtle:  'var(--bg-subtle)',
          muted:   'var(--bg-muted)',
        },
        content: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong:  'var(--border-strong)',
        },
        sidebar: {
          bg:          'var(--sidebar-bg)',
          border:      'var(--sidebar-border)',
          text:        'var(--sidebar-text)',
          'text-active': 'var(--sidebar-text-active)',
          'item-hover':  'var(--sidebar-item-hover)',
          'item-active': 'var(--sidebar-item-active)',
        },
        status: {
          'error-bg':      'var(--error-bg)',
          'error-border':  'var(--error-border)',
          'error-text':    'var(--error-text)',
          'success-bg':    'var(--success-bg)',
          'success-border':'var(--success-border)',
          'success-text':  'var(--success-text)',
          'warning-bg':    'var(--warning-bg)',
          'warning-border':'var(--warning-border)',
          'warning-text':  'var(--warning-text)',
          'info-bg':       'var(--info-bg)',
          'info-border':   'var(--info-border)',
          'info-text':     'var(--info-text)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}

export default config

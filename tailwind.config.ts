import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:         '#0a0a0d',
        surface:    '#111116',
        surface2:   '#18181f',
        surface3:   '#1e1e28',
        accent:     '#c8f060',
        'accent-dim': 'rgba(200,240,96,0.10)',
        'accent-glow': 'rgba(200,240,96,0.20)',
        purple:     '#a78bfa',
        'purple-dim': 'rgba(167,139,250,0.10)',
        coral:      '#fb7185',
        'coral-dim': 'rgba(251,113,133,0.10)',
        blue:       '#60a5fa',
        'blue-dim': 'rgba(96,165,250,0.10)',
        ink:        '#ededf5',
        muted:      '#7a7990',
        dim:        '#3e3d52',
        border:     'rgba(255,255,255,0.07)',
        'border-mid': 'rgba(255,255,255,0.11)',
        'border-active': 'rgba(255,255,255,0.20)',
      },
      fontFamily: {
        syne:   ['var(--font-syne)', 'sans-serif'],
        dm:     ['var(--font-dm-sans)', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        spin: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeUp:  'fadeUp 0.3s ease both',
        fadeIn:  'fadeIn 0.2s ease both',
        scaleIn: 'scaleIn 0.25s ease both',
      },
    },
  },
  plugins: [],
}

export default config

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#080808',
        surface: '#0F0F0F',
        elevated: '#161616',
        hover: '#1C1C1C',
        border: '#262626',
        amber: {
          DEFAULT: '#E8A838',
          glow: 'rgba(232,168,56,0.12)',
          dim: 'rgba(232,168,56,0.35)',
        },
        presence: '#3B82F6',
        danger: '#EF4444',
        success: '#22C55E',
        text: {
          primary: '#F2F2F2',
          secondary: '#8C8C8C',
          muted: '#525252',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      keyframes: {
        'live-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,168,56,0.6)' },
          '50%': { boxShadow: '0 0 0 5px rgba(232,168,56,0)' },
        },
        'sync-flash': {
          '0%': { boxShadow: '0 0 0 0px rgba(232,168,56,0.6)' },
          '100%': { boxShadow: '0 0 0 10px rgba(232,168,56,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'live-pulse': 'live-pulse 2s ease-in-out infinite',
        'sync-flash': 'sync-flash 0.6s ease-out forwards',
        shimmer: 'shimmer 1.5s linear forwards',
      },
      backgroundImage: {
        'amber-hero':
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,168,56,0.08), transparent)',
      },
    },
  },
  plugins: [],
}


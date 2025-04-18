import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        brand: '#e63920',
      },
    },
  },
  plugins: [],
} satisfies Config

import { type Config } from 'tailwindcss'
import animatePlugin from 'tailwindcss-animate'

export default {
  content: ['./app/**/*.{ts,tsx,jsx,js}'],
  darkMode: 'class',
  plugins: [animatePlugin],
} satisfies Config

import type { Config } from '@react-router/dev/config'

export default {
  prerender: ['/about'],
  ssr: true,
} satisfies Config

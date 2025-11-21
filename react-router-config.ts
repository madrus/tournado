import type { Config } from '@react-router/dev/config'

export default {
	prerender: ['/about'],
	ssr: true,
	// Enable buildDirectory for better organization
	buildDirectory: 'build',
} satisfies Config

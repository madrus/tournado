const _getDocsifySettings = () => ({
	name: 'Tournado',
	logo: './images/three-soccer-balls.png',
	repo: 'https://github.com/madrus/tournado',
	loadSidebar: true,
	alias: {
		'/.*/_sidebar.md': '/_sidebar.md',
	},
	auto2top: true,
	basePath: '/',
	maxLevel: 4,
	subMaxLevel: 2,
	sidebarDisplayLevel: 1,
	markdown: {
		smartypants: true,
	},
	plugins: [
		// Plugin to suppress showing YAML frontmatter in the rendered markdown
		(hook) => {
			hook.beforeEach((content) => {
				// Remove YAML frontmatter (content between --- markers)
				return content.replace(/^---[\s\S]*?---\s*/m, '')
			})
		},
	],
	search: 'auto',
	themeColor: 'rgb(3, 201, 137)',
	// Sidebar Collapse Plugin Settings
	collapse: {
		multipleOpen: true,
	},
	// Copy code button
	copyCode: {
		buttonText: 'Copy',
		errorText: 'Error',
		successText: 'Copied',
	},
	// External script support
	externalLinkTarget: '_blank',
	// Emoji support
	emoji: {
		// Add custom emojis if needed
	},
})

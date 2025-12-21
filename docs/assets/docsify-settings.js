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
		// Collapse all top-level sections except Home — robust: retries and observes changes
		(hook) => {
			hook.doneEach(() => {
				const SIDEBAR_SELECTORS = ['.sidebar', '#sidebar']
				const findSidebar = () =>
					SIDEBAR_SELECTORS.map((s) => document.querySelector(s)).find(Boolean)
				const isHomeLink = (li) =>
					!!li.querySelector(
						'a[href="README.md"], a[href="./README.md"], a[href="/README.md"], a[href="index.html"], a[href="./index.html"]',
					)

				const applyCollapse = (root) => {
					const topUl = root.querySelector('nav > ul') || root.querySelector('ul')
					if (!topUl) return false
					const topLis = Array.from(topUl.children).filter((n) => n.tagName === 'LI')
					topLis.forEach((li) => {
						const submenu = li.querySelector(':scope > ul') || li.querySelector('ul')
						if (!submenu) return
						if (isHomeLink(li)) {
							li.classList.add('open')
							submenu.style.display = ''
						} else {
							li.classList.remove('open')
							submenu.style.display = 'none'
						}
					})
					// If nothing is open, open the first top-level item that has a submenu (best-effort Home fallback)
					const anyOpen = topLis.some((li) => li.classList?.contains('open'))
					if (!anyOpen) {
						const firstWithSub = topLis.find(
							(li) => li.querySelector(':scope > ul') || li.querySelector('ul'),
						)
						if (firstWithSub) {
							const submenu =
								firstWithSub.querySelector(':scope > ul') ||
								firstWithSub.querySelector('ul')
							firstWithSub.classList.add('open')
							if (submenu) submenu.style.display = ''
						}
					}
					return true
				}

				let attempts = 0
				const MAX_ATTEMPTS = 8
				const RETRY_MS = 120

				const tryApply = () => {
					const root = findSidebar()
					if (root && applyCollapse(root)) {
						// Observe future changes and reapply collapse when sidebar is re-rendered
						if (!root.__tournado_sidebar_observer) {
							try {
								const obs = new MutationObserver(() => applyCollapse(root))
								obs.observe(root, { childList: true, subtree: true })
								root.__tournado_sidebar_observer = obs
							} catch (_e) {
								// ignore if MutationObserver not available
							}
						}
						return
					}
					if (attempts++ < MAX_ATTEMPTS) {
						setTimeout(tryApply, RETRY_MS)
					}
				}

				tryApply()
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

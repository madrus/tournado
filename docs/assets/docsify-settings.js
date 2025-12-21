window.getDocsifySettings = () => ({
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
		// Remove YAML frontmatter
		(hook) => {
			hook.beforeEach((content) => content.replace(/^---[\s\S]*?---\s*/m, ''))
		},
		// Collapse top-level sections but keep the Home section open
		(hook) => {
			hook.doneEach(() => {
				const selectors = ['.sidebar', '#sidebar']
				const findRoot = () =>
					selectors.map((s) => document.querySelector(s)).find(Boolean)
				const isHomeLink = (li) =>
					!!li.querySelector(
						'a[href="README.md"], a[href="./README.md"], a[href="/README.md"], a[href="index.html"], a[href="./index.html"]',
					)

				const apply = (root) => {
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

					// Ensure at least the first section with children is open (fallback for Home)
					const anyOpen = topLis.some((li) => li.classList?.contains('open'))
					if (!anyOpen) {
						const firstWith = topLis.find(
							(li) => li.querySelector(':scope > ul') || li.querySelector('ul'),
						)
						if (firstWith) {
							firstWith.classList.add('open')
							const sub =
								firstWith.querySelector(':scope > ul') || firstWith.querySelector('ul')
							if (sub) sub.style.display = ''
						}
					}

					return true
				}

				let tries = 0
				const MAX = 10
				const RETRY = 100

				const attempt = () => {
					const root = findRoot()
					if (root && apply(root)) {
						if (!root.__tournado_obs) {
							try {
								const obs = new MutationObserver(() => apply(root))
								obs.observe(root, { childList: true, subtree: true })
								root.__tournado_obs = obs
							} catch {}
						}
						return
					}
					if (tries++ < MAX) setTimeout(attempt, RETRY)
				}

				attempt()
			})
		},
	],
	search: 'auto',
	themeColor: 'rgb(3, 201, 137)',
	collapse: { multipleOpen: true },
	copyCode: { buttonText: 'Copy', errorText: 'Error', successText: 'Copied' },
	externalLinkTarget: '_blank',
	emoji: {},
})

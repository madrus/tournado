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
  sidebarDisplayLevel: 0,
  markdown: {
    smartypants: true,
  },
  plugins: [
    // Remove YAML frontmatter
    hook => {
      hook.beforeEach(content => content.replace(/^---[\s\S]*?---\s*/, ''))
    },
  ],
  search: 'auto',
  themeColor: 'rgb(3, 201, 137)',
  collapse: { multipleOpen: true },
  copyCode: { buttonText: 'Copy', errorText: 'Error', successText: 'Copied' },
  externalLinkTarget: '_blank',
  emoji: {},
})

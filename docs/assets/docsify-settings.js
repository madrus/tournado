const getDocsifySettings = () => ({
  name: 'Tournado',
  logo: './images/three-soccer-balls.png',
  repo: 'https://github.com/madrus/tournado',
  loadSidebar: true,
  alias: {
    '/.*/_sidebar.md': '/_sidebar.md',
  },
  auto2top: true,
  basePath: '/',
  coverpage: true,
  maxLevel: 4,
  subMaxLevel: 2,
  markdown: {
    smartypants: true,
  },
  search: 'auto',
  themeColor: '#3F51B5',
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

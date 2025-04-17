// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // Mermaid configuration
  mermaid: {
    theme: 'dark',
    themeVariables: {
      primaryColor: '#3F51B5',
      primaryTextColor: '#fff',
      primaryBorderColor: '#7C4DFF',
      lineColor: '#fff',
      secondaryColor: '#006064',
      tertiaryColor: '#fff',
      // Additional variables for better visibility
      nodeBorder: '#fff',
      mainBkg: '#1a1a1a', // Dark background
      nodeTextColor: '#fff',
      edgeLabelBackground: '#1a1a1a',
      clusterBkg: '#1a1a1a', // Dark subgraph background
      clusterBorder: '#fff', // White border
      titleColor: '#fff',
      labelBoxBkgColor: '#1a1a1a',
      labelBoxBorderColor: '#fff',
      labelTextColor: '#fff',
      // Additional theme settings
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      // Graph background
      background: '#1a1a1a', // Dark diagram background
      // Sequence diagram specific
      actorBkg: '#2d2d2d',
      actorBorder: '#fff',
      actorTextColor: '#fff',
      actorLineColor: '#fff',
      signalColor: '#fff',
      signalTextColor: '#fff',
      loopTextColor: '#fff',
      noteBorderColor: '#fff',
      noteBkgColor: '#2d2d2d',
      noteTextColor: '#fff',
      messageTextColor: '#fff',
      messageBorderColor: '#fff',
      messageBackgroundColor: '#1a1a1a',
    },
  },
})

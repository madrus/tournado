/** @type {import('prettier').Config} */
import prettierConfig from '@madrus/configs/prettier.config.mjs'

prettierConfig.overrides = [
  ...prettierConfig.overrides,
  {
    files: ['*.md', '*.mdx'],
    options: {
      tabWidth: 3,
      proseWrap: 'preserve',
    },
  },
]

// Add tailwindcss plugin to the existing plugins array
const plugins = [
  ...(prettierConfig.plugins || []),
  '@trivago/prettier-plugin-sort-imports',
  'prettier-plugin-tailwindcss',
]

export default {
  ...prettierConfig,
  importOrder: [
    '^(node|@conform-to)',
    '^@react-router/.*|^isbot|^react-dom/server',
    '^(react|zod)',
    '^@(?!/)[^/].*',
    '^(zustand|vitest|cy)(.*)',
    '^(?!@)[a-zA-Z0-9-]+',
    '^~/(.*)',
    '^[./]',
    '^.*',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderCaseInsensitive: true,
  plugins,
}

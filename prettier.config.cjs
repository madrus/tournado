/** @type {import('prettier').Config} */
const madrusConfig = require('@madrus/configs')

// Get the base prettier config
const prettierConfig = madrusConfig.prettier

// Add tailwindcss plugin to the existing plugins array
const plugins = [
  ...(prettierConfig.plugins || []),
  '@trivago/prettier-plugin-sort-imports',
  'prettier-plugin-tailwindcss',
]

module.exports = {
  ...prettierConfig,
  importOrder: [
    '^(node|@conform-to)',
    '^@remix-run/(css-bundle|node|react)|^isbot|^react-dom/server',
    '^(react|zod)',
    '^@/(?!.*)',
    '^(zustand|vitest|cy|jest)(.*)',
    '^(?!src|test|.*/).*$',
    '^(src|test)(.*)',
    '^@',
    '^[./]',
    '^.*',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderCaseInsensitive: true,
  plugins,
}

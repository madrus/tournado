export function withMockImports(existingOptions) {
  const extra =
    '--import tsx/esm --import ./test/mocks/node-polyfills.ts --import ./test/mocks/index.ts'
  return existingOptions ? `${existingOptions} ${extra}` : extra
}

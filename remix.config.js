/** @type {import('@remix-run/dev').AppConfig} */
export default {
  cacheDirectory: './node_modules/.cache/remix',
  ignoredRouteFiles: ['**/.*', '**/*.test.{ts,tsx}'],
  // Enable sourcemaps only in development
  sourcemap: true,
  // Note: The docs/ directory is not served in production as it's not in the public/ directory
  // This keeps documentation private while still maintaining it in source control
  serverModuleFormat: 'esm',
  serverPlatform: 'node',
  tailwind: true,
}

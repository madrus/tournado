import { flatRoutes } from 'remix-flat-routes'

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  cacheDirectory: './node_modules/.cache/remix',
  // Enable sourcemaps only in development
  devServer: {
    sourcemap: true,
  },
  // Note: The docs/ directory is not served in production as it's not in the public/ directory
  // This keeps documentation private while still maintaining it in source control
  serverModuleFormat: 'esm',
  tailwind: true,
  postcss: true,
  watchPaths: ['./tailwind.config.ts'],
  routes: async defineRoutes => {
    return flatRoutes('routes', defineRoutes, {
      ignoredRouteFiles: ['.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}', '**/__*.*'],
    })
  },
}

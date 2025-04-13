/** @type {import('@remix-run/dev').AppConfig} */
export default {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.test.{ts,tsx}"],
  // Enable sourcemaps only in development
  sourcemap: process.env.NODE_ENV !== "production",
};

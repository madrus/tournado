import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  // Public routes
  index('routes/index.tsx'),
  route('about', 'routes/about.tsx'),
  route('unauthorized', 'routes/unauthorized.tsx'),
  route('resources/healthcheck', 'routes/resources/healthcheck.tsx'),
  route('teams', 'layouts/teams-layout.tsx', [
    index('routes/teams/index.tsx'),
    route('new', 'routes/teams/new.tsx'),
    route(':teamId', 'routes/teams/team.tsx'),
  ]),

  // Auth routes (public)
  route('auth', 'layouts/auth-layout.tsx', [
    route('signin', 'routes/auth/signin.tsx'),
    route('signup', 'routes/auth/signup.tsx'),
    route('signout', 'routes/auth/signout.tsx'),
  ]),

  // Protected routes (all authenticated users)
  route('profile', 'routes/profile.tsx'),
  route('settings', 'routes/settings.tsx'),

  // Admin routes (admin-only)
  route('a7k9m2x5p8w1n4q6r3y8b5t1', 'layouts/admin-layout.tsx', [
    index('routes/admin/index.tsx'),
  ]),
] satisfies RouteConfig

import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  // Public routes
  index('routes/index.tsx'),
  route('about', 'routes/about.tsx'),
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

  // Protected routes
  route('profile', 'routes/profile.tsx'),
  route('settings', 'routes/settings.tsx'),
] satisfies RouteConfig

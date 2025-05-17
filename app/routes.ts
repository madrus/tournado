import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('./routes/index.tsx'),
  route('profile', './routes/profile.tsx'),
  route('settings', './routes/settings.tsx'),
  route('about', 'routes/about.tsx'),
  route('resources/healthcheck', './routes/resources/healthcheck.tsx'),
  layout('./routes/layouts/teams.tsx', [
    index('./routes/teams/index.tsx'),
    route('new', './routes/teams/new.tsx'),
    route(':teamId', './routes/teams/team.tsx'),
  ]),
  layout('./routes/layouts/auth.tsx', [
    route('signin', './routes/auth/signin.tsx'),
    route('signup', './routes/auth/signup.tsx'),
    route('signout', './routes/auth/signout.tsx'),
  ]),
] satisfies RouteConfig

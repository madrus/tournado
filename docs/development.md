# Development

## Project Structure

The project follows a standard Remix application structure:

```
app/
  ├── components/     # Reusable UI components
  ├── models/        # Database models and server-side logic
  ├── routes/        # Application routes
  ├── styles/        # Global styles
  └── utils/         # Utility functions
```

## Key Features

- **Authentication**: Email/password authentication with cookie-based sessions
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS for modern UI
- **Testing**: Cypress for E2E tests and Vitest for unit tests
- **Type Safety**: Full TypeScript support

## Development Workflow

1. Start the development server:

```sh
pnpm dev
```

2. Run tests:

```sh
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e:dev

# Run unit tests
pnpm test:unit
```

3. Format code:

```sh
pnpm format
```

4. Type checking:

```sh
pnpm typecheck
```

## Code Style

- Use Prettier for code formatting
- Follow ESLint rules
- Write TypeScript with strict mode enabled
- Use functional components with hooks
- Follow the Remix conventions for routes and loaders

5. Test the Dockerfile

```sh
docker build -t tournado:test .
docker run -p 8080:8080 tournado:test
```

## Development Guidelines

### Script you can use

- `npm run test` to run unit tests once
- `npm run test:e2e:run` to run playwright e2e tests once
- `npm run lint` - to run eslint
- `npm run typecheck` - to run tsc linter
- `npm run format` - to run prettier formatting

### Rules

- Always use the semantic color classes from app/styles/tailwind.css if the colors fall under ColorAccent type.
- Avoid direct Node access. Prefer using the methods from Testing Library.
- Avoid "any" as type. Always use strong typing.

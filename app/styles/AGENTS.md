# Styling Rules and Patterns

## Semantic Colors

- **Warning Color**: The global warning color is **amber**. It was updated from yellow for better visual consistency.
- **Definition Locations**: Semantic colors are defined in three critical locations. When updating a semantic color, ensure all three are in sync:
  1. `app/styles/colors.css`: Base CSS variable definitions.
  2. `app/styles/tailwind_theme.css`: `@theme` inline definitions and adaptive variables.
  3. `app/styles/tailwind_dark.css`: Dark mode overrides for adaptive colors (e.g., `--color-adaptive-bg-warning`).

## Color System

- **Adaptive Colors**: The project uses an adaptive color system with 3 variants: base (600), bg (600), and selected (800) weights.
- **Tailwind 4**: The project uses Tailwind CSS v4 with OKLCH color values.
  - Example: `amber-500` is `oklch(76.9% 0.188 70.08)`.

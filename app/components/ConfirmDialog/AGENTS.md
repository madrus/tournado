# ConfirmDialog Component Rules

## Component Usage

- **ConfirmDialog** (controlled): Use when you need to manage the open state externally or handle async operations (e.g., showing a loading state while saving).
- **SimpleConfirmDialog** (uncontrolled): Use for quick confirmations where the dialog can close immediately on action.

## Styling Patterns

- **Cancel Buttons**: Always use `variant='secondary'` and `color='disabled'`. This ensures a consistent slate border and text styling across all dialogs.
- **Intent Colors**: Dialogs support four intents: `warning`, `danger`, `info`, and `success`.
  - `warning` intent uses **amber** colors.
  - `danger` intent uses **brand/red** colors.
- **Centralization**: All intent-to-color and intent-to-icon mappings are centralized in `dialog.utils.ts` and `dialog.variants.ts`.

## Testing

- New dialog logic or variants should be tested in:
  - `app/components/ConfirmDialog/__tests__/dialog.utils.test.ts`
  - `app/components/ConfirmDialog/__tests__/dialog.variants.test.ts`
- Component rendering and interactions should be tested in:
  - `app/components/ConfirmDialog/__tests__/ConfirmDialog.test.tsx`
  - `app/components/ConfirmDialog/__tests__/SimpleConfirmDialog.test.tsx`

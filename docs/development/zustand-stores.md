# Zustand Stores

This document captures the decisions and patterns for Zustand usage in Tournado.
The goal is predictable state, minimal re-renders, and clean separation between
state, actions, and derived logic.

## Principles

- **Selector-first**: every hook call must pass a selector
- **Narrow subscriptions**: use selector hooks and `useShallow` to avoid re-render storms
- **Pure helpers**: derive and mutate state in external helper functions
- **No cross-feature re-exports**: keep store APIs feature-scoped
- **Avoid transient persistence**: do not persist `loading` or `error`

## Store Structure

Each store exposes:

- `State` and `Actions` types
- store hook that requires a selector
- feature-specific selector hooks
- action hooks that bundle actions with `useShallow`
- hydration hook if persistence is used

## Selector-Only Store Hooks

We enforce selector-only usage to prevent accidental full-store subscriptions.
Calls like `useSettingsStore()` must error at type-check time.

```typescript
type SettingsStore = StoreState & Actions
type SettingsSelector<T> = (state: SettingsStore) => T

const useSettingsStoreBase = create<StoreState & Actions>()(/* ... */)

export const useSettingsStore = Object.assign(
	<T>(selector: SettingsSelector<T>) => useSettingsStoreBase(selector),
	{
		getState: useSettingsStoreBase.getState,
		setState: useSettingsStoreBase.setState,
		subscribe: useSettingsStoreBase.subscribe,
		persist: useSettingsStoreBase.persist,
	},
) as (<T>(selector: SettingsSelector<T>) => T) & {
	getState: typeof useSettingsStoreBase.getState
	setState: typeof useSettingsStoreBase.setState
	subscribe: typeof useSettingsStoreBase.subscribe
	persist: typeof useSettingsStoreBase.persist
}
```

## Selector Hooks

Use focused selector hooks for reads. Prefer single-field selectors to reduce
churn.

```typescript
export const useSettingsTheme = () => useSettingsStore((state) => state.theme)
export const useSettingsLanguage = () =>
	useSettingsStore((state) => state.language)
export const useSettingsIsRTL = () => useSettingsStore((state) => state.isRTL)
```

## Action Hooks

Bundle actions with `useShallow` to avoid unnecessary re-renders in components.

```typescript
export const useSettingsActions = () =>
	useSettingsStore(
		useShallow((state) => ({
			setTheme: state.setTheme,
			toggleTheme: state.toggleTheme,
			setLanguage: state.setLanguage,
			resetSettingsStoreState: state.resetSettingsStoreState,
		})),
	)
```

## Pure Helpers

Keep derived logic out of the store body. Helpers must be pure and return new
state. This keeps store actions small and testable.

```typescript
export const isSnapshotDirty = (
	snapshot: GroupAssignmentSnapshot | null,
	originalSnapshot: GroupAssignmentSnapshot | null,
): boolean => {
	if (!snapshot || !originalSnapshot) return false
	return JSON.stringify(snapshot) !== JSON.stringify(originalSnapshot)
}
```

## Snapshot Pattern

For editor-style UIs we use a **snapshot pair**:

- `snapshot`: working copy
- `originalSnapshot`: baseline copy for dirty/reset

Actions update the working copy; the baseline is only updated on save.

```typescript
export const useGroupAssignmentActions = () =>
	useGroupAssignmentStore(
		useShallow((state) => ({
			setSnapshotPair: state.setSnapshotPair,
			resetSnapshotPair: state.resetSnapshotPair,
			markAsSaved: state.markAsSaved,
		})),
	)
```

## Hydration and Persistence

Use `persist` + hydration hooks when UI state must survive reloads. Avoid
persisting transient state like `loading` or `error`.

```typescript
partialize: (state) =>
	isBrowser ? { user: state.user, firebaseUser: state.firebaseUser } : {}
```

```typescript
export const useAuthStoreHydration = (): void => {
	useEffect(() => {
		if (isBrowser) {
			useAuthStore.persist.rehydrate()
		}
	}, [])
}
```

## Naming

Use explicit, verb-based names:

- `setSnapshotPair`
- `resetSnapshotPair`
- `markAsSaved`
- `useTeamFormActions`, `useTeamFormFields`, `useTeamFormStatus`

## Do / Do Not

```text
Do:
- use selectors and action hooks
- keep store actions thin
- move logic to helper modules

Do not:
- call a store hook without a selector
- persist transient flags
- build central re-exports across features
```

## Usage Examples

Component reads from focused selectors and uses action hooks. This keeps renders
stable and avoids full-store subscriptions.

```typescript
import { useSettingsActions, useSettingsTheme } from '~/stores/useSettingsStore'

export function ThemeToggle(): JSX.Element {
	const theme = useSettingsTheme()
	const { toggleTheme } = useSettingsActions()

	return (
		<button type="button" onClick={toggleTheme}>
			Theme: {theme}
		</button>
	)
}
```

Form components should subscribe to field subsets and computed helpers only,
and use action hooks for mutations.

```typescript
import {
	useTournamentFormActions,
	useTournamentFormFields,
	useTournamentFormStatus,
} from '~/features/tournaments/stores/useTournamentFormStore'
import { getIsFormReadyForSubmission } from '~/features/tournaments/stores/helpers/tournamentFormHelpers'

export function TournamentForm(): JSX.Element {
	const { name, startDate, endDate } = useTournamentFormFields()
	const { isFormDirty } = useTournamentFormStatus()
	const { updateName, updateDateRange } = useTournamentFormActions()

	const isReady = getIsFormReadyForSubmission({ name, startDate, endDate })

	return (
		<form>
			<input value={name} onChange={(event) => updateName(event.target.value)} />
			<button type="submit" disabled={!isReady || !isFormDirty}>
				Save
			</button>
		</form>
	)
}
```

Snapshot-based editors read the snapshot pair and use helper functions for
derived data, not store methods.

```typescript
import {
	useGroupAssignmentSnapshots,
	useGroupAssignmentActions,
} from '~/features/competition/stores/useGroupAssignmentStore'
import { getTeamLocation } from '~/features/competition/stores/helpers/groupAssignmentStoreHelpers'

export function GroupAssignmentBoard(): JSX.Element {
	const { snapshot, originalSnapshot } = useGroupAssignmentSnapshots()
	const { setSnapshotPair } = useGroupAssignmentActions()

	const location = snapshot ? getTeamLocation(snapshot, 'team-1') : null

	return (
		<button
			type="button"
			onClick={() =>
				setSnapshotPair({
					snapshot: snapshot ?? null,
					originalSnapshot: originalSnapshot ?? null,
				})
			}
		>
			Location: {location ?? 'unknown'}
		</button>
	)
}
```

## Unit Testing

Test Zustand stores with the real store API, not mocks. Keep the focus on
store actions and state transitions, and leave persistence to Zustand.

Guidelines:

- Use `useStore.getState` (notice no brackets as we are assigning the function, not the result of its invocation) and invoke actions directly in the tests
- Reset state in `beforeEach` using the store’s reset action
- Keep helper logic tested in helper test files, not in the store tests
- Avoid testing `persist`/storage behavior (that is Zustand’s job)

Example:

```typescript
import { beforeEach, describe, expect, it } from 'vitest'

import { useGroupAssignmentStore } from '~/features/competition/stores/useGroupAssignmentStore'

const state = useGroupAssignmentStore.getState

describe('useGroupAssignmentStore', () => {
	beforeEach(() => {
		state().clearStore()
	})

	it('assigns a team to a slot', () => {
		state().setSnapshotPair(mockSnapshot)
		state().assignTeamToSlot('team-1', 'group-1', 0)

		expect(state().snapshot?.groups[0].slots[0].team?.id).toBe('team-1')
	})
})
```

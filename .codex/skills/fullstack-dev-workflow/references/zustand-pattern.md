# Zustand Store Pattern

Standard pattern for creating Zustand stores with SSR support, persistence, DevTools integration, and proper TypeScript typing.

## Key Features

- **SSR-safe**: Works with React Router v7 server-side rendering
- **Persistence**: Optional sessionStorage/localStorage with partial state
- **DevTools**: Redux DevTools integration with action names
- **Server-side mock**: Graceful handling when storage APIs unavailable
- **Cookie sync**: For server-side hydration of critical state
- **Custom merge**: Smart merging of persisted and server state

## Template Structure

```typescript
import { useEffect } from 'react'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { isBrowser } from '~/lib/lib.helpers'

// Helper function for cookie management
const setCookie = (name: string, value: string) => {
  if (isBrowser) {
    document.cookie = `${name}=${value}; path=/; max-age=31536000`
  }
}

// 1. Define your state type
type StoreState = {
  // Your state properties
  theme: 'light' | 'dark'
  language: string
  // ... other state
}

// 2. Define your actions separately
type Actions = {
  // Your action methods
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  resetStore: () => void
  // ... other actions
}

// 3. Name your store for DevTools
const storeName = 'MyFeatureStore'

// 4. Define initial state
const initialStoreState: StoreState = {
  theme: 'light',
  language: 'en',
  // ... other initial values
}

// 5. Server-side storage mock
const createServerSideStorage = () => ({
  getItem: () => null,
  setItem: () => {
    // Server-side no-op
  },
  removeItem: () => {
    // Server-side no-op
  },
})

// 6. Create the store
export const useMyFeatureStore = create<StoreState & Actions>()(
  devtools(
    persist(
      (set, _get) => ({
        ...initialStoreState,

        // Reset action (always include)
        resetStore: () => {
          set(initialStoreState, false, 'resetStore')
        },

        // Your custom actions
        setTheme: theme => {
          set({ theme }, false, 'setTheme')
          // Optional: sync to cookies for SSR
          if (isBrowser) {
            setCookie('theme', theme)
          }
        },

        toggleTheme: () => {
          set(
            state => {
              const newTheme = state.theme === 'light' ? 'dark' : 'light'
              if (isBrowser) {
                setCookie('theme', newTheme)
              }
              return { theme: newTheme }
            },
            false,
            'toggleTheme',
          )
        },
      }),
      {
        name: storeName,

        // Choose storage: sessionStorage or localStorage
        storage: isBrowser
          ? createJSONStorage(() => sessionStorage) // or localStorage
          : createJSONStorage(createServerSideStorage),

        // Skip hydration on server
        skipHydration: !isBrowser,

        // Partial persistence: only save specific fields
        partialize: state =>
          isBrowser
            ? {
                theme: state.theme,
                // Add other fields to persist
              }
            : {},

        // Custom merge strategy
        merge: (persistedState, currentState) => ({
          ...currentState,
          // Merge only specific fields
          theme: (persistedState as Partial<StoreState>)?.theme ?? currentState.theme,
        }),
      },
    ),
    {
      name: storeName,
    },
  ),
)

// 7. Optional: Hydration hook
export const useMyFeatureStoreHydration = (): void => {
  useEffect(() => {
    if (isBrowser) {
      useMyFeatureStore.persist.rehydrate()
    }
  }, [])
}
```

## Usage in Components

```typescript
// Access state and actions
function MyComponent() {
  const theme = useMyFeatureStore((state) => state.theme)
  const setTheme = useMyFeatureStore((state) => state.setTheme)

  return (
    <button onClick={() => setTheme('dark')}>
      Current: {theme}
    </button>
  )
}

// With hydration
function App() {
  useMyFeatureStoreHydration()

  return <MyComponent />
}
```

## Storage Strategies

### sessionStorage

- Persists across page refreshes
- Cleared when tab/window closes
- Good for: UI preferences, temporary state

### localStorage

- Persists across browser sessions
- Cleared manually or by user
- Good for: User settings, long-term preferences

### No Persistence

Simply omit the `persist` middleware:

```typescript
export const useMyStore = create<StoreState & Actions>()(
  devtools(
    (set, _get) => ({
      // ... store implementation
    }),
    { name: storeName },
  ),
)
```

## Cookie Sync Pattern

For state that needs to be available server-side (theme, language, etc.):

```typescript
// In your action
setTheme: theme => {
  set({ theme }, false, 'setTheme')
  if (isBrowser) {
    setCookie('theme', theme) // Helper function
  }
}

// In your root loader (React Router v7)
export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get('Cookie')
  const theme = getCookie(cookieHeader, 'theme') ?? 'light'

  return { theme }
}
```

## Common Patterns

### Computed Values

Use selectors for derived state (recommended for Zustand's plain object stores):

```typescript
// In component
const isDarkMode = useMyFeatureStore(state => state.theme === 'dark')
```

Avoid store getters unless you add middleware like `subscribeWithSelector`. If you still want a getter, wire it explicitly:

```typescript
type StoreState = {
  theme: 'light' | 'dark'
  // Computed
  get isDarkMode(): boolean
}

// In store
get isDarkMode() {
  return _get().theme === 'dark'
}
```

### Async Actions

```typescript
type Actions = {
  fetchData: () => Promise<void>
}

// In store
fetchData: async () => {
  set({ isLoading: true }, false, 'fetchData:start')
  try {
    const data = await apiClient.getData()
    set({ data, isLoading: false }, false, 'fetchData:success')
  } catch (error) {
    set({ error, isLoading: false }, false, 'fetchData:error')
  }
}
```

### Resetting Specific Fields

```typescript
resetTheme: () => {
  set({ theme: initialStoreState.theme }, false, 'resetTheme')
}
```

## Best Practices

1. **Always name actions** in the third parameter to `set()` for DevTools
2. **Type everything** - no `any` types
3. **One store per feature or page** unless shared globally (auth, toggles)
4. **Use partialize** to avoid persisting unnecessary state
5. **Include reset function** for easy cleanup
6. **Cookie sync** for SSR-critical state only
7. **Use selectors** to prevent unnecessary re-renders

## Example: Full Settings Store

See `useSettingsStore.ts` in the codebase for a production example with:

- Theme switching with cookie sync
- Language selection with RTL computation
- Partial persistence (theme only)
- Custom merge logic
- Hydration hook
- SSR-safe implementation

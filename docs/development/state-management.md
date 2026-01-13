# State Management

This document describes the state management architecture in the Tournado application, including client-side stores, hydration patterns, and persistence strategies.

---

## 1. Architecture Overview

The application uses a hybrid state management approach:

- **Server State**: Managed by React Router loaders and actions
- **Client State**: Managed by Zustand stores with persistence
- **Language State**: Reactive persistence using cookies and localStorage
- **Form State**: Managed by React Hook Form

### Key Principles

1. **Server-first**: Prefer server state for data that needs to be fresh
2. **Selective persistence**: Only persist essential client state
3. **Hydration safety**: Avoid side effects during module loading
4. **SSR compatibility**: Ensure stores work correctly with server-side rendering

---

## 2. Auth Store (Zustand)

### Implementation

The auth store manages user authentication state using Zustand with persistence:

```typescript
// app/stores/useAuthStore.ts
export const useAuthStore = create<StoreState & Actions>()(
  devtools(
    persist(
      set => ({
        authenticated: false,
        username: '',
        setAuth: (authenticated, username) => set({ authenticated, username }),
      }),
      {
        name: 'auth-store-storage',
        storage: isBrowser
          ? createJSONStorage(() => sessionStorage)
          : createJSONStorage(createServerSideStorage),
        skipHydration: !isBrowser,
        partialize: state => (isBrowser ? state : {}),
      },
    ),
  ),
)
```

### Hydration Pattern

**Problem**: Module-level rehydration can cause side effects in tests and SSR.

**Solution**: Component-level hydration using a custom hook:

```typescript
export const useAuthStoreHydration = (): void => {
  useEffect(() => {
    if (isBrowser) {
      useAuthStore.persist.rehydrate()
    }
  }, [])
}
```

### Usage in Components

```typescript
export default function App({ loaderData }: Route.ComponentProps): JSX.Element {
  const { setAuth } = useAuthStore()

  // Handle auth store rehydration
  useAuthStoreHydration()

  // Update auth store after hydration
  useEffect(() => {
    setAuth(authenticated, username)
  }, [authenticated, username, setAuth])
}
```

### Benefits

✅ **No side effects during import** - Rehydration only happens when components mount
✅ **Test-friendly** - Tests don't trigger unwanted rehydration
✅ **SSR-safe** - Rehydration only occurs on the client side
✅ **Controlled timing** - Components decide when to rehydrate

---

## 3. Language Persistence

### Reactive Cookie System

Language changes are persisted reactively using both cookies and localStorage:

```typescript
// app/root.tsx
useEffect(() => {
  if (typeof window !== 'undefined' && i18nInstance.language) {
    // Write both cookie and localStorage for persistence
    document.cookie = `lang=${i18nInstance.language}; path=/; max-age=31536000`
    localStorage.setItem('lang', i18nInstance.language)
  }
}, [currentLanguage, i18nInstance.language])
```

### Server-Side Detection

The server reads language preferences during the initial request:

```typescript
// app/root.tsx loader
export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const cookieHeader = request.headers.get('Cookie') || ''
  const langMatch = cookieHeader.match(/lang=([^;]+)/)
  const language = langMatch ? langMatch[1] : 'nl'

  return { language /* ... */ }
}
```

### Language Switching Hook

```typescript
// app/hooks/useLanguageSwitcher.ts
export function useLanguageSwitcher(): (language: string) => void {
  const { i18n } = useTranslation()

  return (language: string): void => {
    i18n.changeLanguage(language)
  }
}
```

### Benefits

✅ **Server-side detection** - Language available during SSR
✅ **Automatic persistence** - No manual save/load logic needed
✅ **Fallback support** - localStorage backup if cookies fail
✅ **Clean separation** - Hook handles i18n, root handles persistence

---

## 4. Storage Strategies

### SessionStorage vs LocalStorage

| Use Case            | Storage Type          | Reason                             |
| ------------------- | --------------------- | ---------------------------------- |
| Auth state          | SessionStorage        | Security - cleared when tab closes |
| Language preference | Cookie + LocalStorage | Persistence across sessions + SSR  |
| Form drafts         | LocalStorage          | Survive accidental tab closure     |

### Server-Side Storage Mock

For SSR compatibility, we provide storage mocks:

```typescript
const createServerSideStorage = () => ({
  getItem: () => null,
  setItem: () => {}, // Server-side no-op
  removeItem: () => {}, // Server-side no-op
})
```

---

## 5. Hydration Best Practices

### ❌ Avoid Module-Level Side Effects

```typescript
// BAD: Side effects during module load
if (isBrowser) {
  useAuthStore.persist.rehydrate() // Runs during import!
}
```

### ✅ Use Component-Level Hydration

```typescript
// GOOD: Controlled hydration in components
export const useAuthStoreHydration = (): void => {
  useEffect(() => {
    if (isBrowser) {
      useAuthStore.persist.rehydrate()
    }
  }, [])
}
```

### ✅ Handle SSR Gracefully

```typescript
// GOOD: Skip hydration on server
{
  skipHydration: !isBrowser,
  partialize: state => (isBrowser ? state : {}),
}
```

---

## 6. Testing Considerations

### Store Testing

```typescript
// app/stores/__tests__/useAuthStore.test.ts
describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().setAuth(false, '')
  })

  it('should update auth state', () => {
    const { setAuth } = useAuthStore.getState()
    setAuth(true, 'test@example.com')

    expect(useAuthStore.getState().authenticated).toBe(true)
  })
})
```

### Avoiding Hydration in Tests

Since we use component-level hydration, tests can import stores without triggering rehydration side effects.

---

## 7. Migration Guide

### From Module-Level to Component-Level Hydration

1. **Remove module-level rehydration**:

   ```typescript
   // Remove this from store files
   if (isBrowser) {
     useStore.persist.rehydrate()
   }
   ```

2. **Create hydration hook**:

   ```typescript
   export const useStoreHydration = (): void => {
     useEffect(() => {
       if (isBrowser) {
         useStore.persist.rehydrate()
       }
     }, [])
   }
   ```

3. **Use in components**:

   ```typescript
   function App() {
     useStoreHydration()
     // ... rest of component
   }
   ```

---

## Data Freshness and Navigation

For strategies to ensure your UI always shows the latest data after edits or navigation (such as using popstate and revalidation in list pages), see [Data Freshness](development/data-freshness.md).

---

## Summary

- **Auth store** uses Zustand with sessionStorage and component-level hydration
- **Language persistence** uses reactive cookies + localStorage for SSR compatibility
- **Hydration** is handled at the component level to avoid side effects
- **Testing** is simplified by avoiding module-level side effects
- **SSR compatibility** is ensured through proper storage mocking and hydration skipping

For more details on specific implementations, see the source files in `app/stores/` and `app/hooks/`.

---
title: Fixing i18n Configuration Errors
type: conversation
permalink: conversations/tournado-2025-04-27-06-25-fixing-i18n-configuration-errors
---

# Fixing i18n Configuration Errors

_Created: 4/27/2025, 6:25:21 AM_

_Workspace: `tournado`_

### user

I have i18n related errors. We need to fix 66: Property 'language' does not exist on type 'Promise<TFunction<"translation", undefined>>'.74: Type 'Promise<TFunction<"translation", undefined>>' is missing the following properties from type 'i18n': t, init, loadResources, use, and 33 more.

**Context:**
_Metadata:_ Has Context

---

### assistant

⏱️ 1745727346.2s • 1/1/1970, 1:12:19 AM → 4/27/2025, 6:28:06 AM

Looking at the errors, I see that `i18n` is being imported incorrectly in root.tsx. The issue appears to be related to the promise being returned from your i18n configuration. Let me check the i18n setup.

**Context:**
_Metadata:_ Has Context

---

### assistant

Let me check what's in the index.ts file:

**Context:**
_Metadata:_ Has Context

---

### assistant

Now let's check how root.tsx imports i18n:

**Context:**
_Metadata:_ Has Context

---

### assistant

I see the issue. The i18n configuration in config.ts is returning a Promise from i18next.init() rather than the actual i18n instance. Let me modify the config.ts file to fix this:

**Context:**
_Metadata:_ Has Context

---

### assistant

The key changes I made were:

1. Separated the `i18n` initialization from the `.init()` call
2. Added `initImmediate: false` to ensure synchronous initialization
3. Used `i18n.changeLanguage()` instead of the imported `changeLanguage` function

This should fix the TypeScript errors because now we're exporting the actual i18n instance rather than a Promise from the initialization.

Let's check if there are any other issues to address:

**Context:**
_Metadata:_ Has Context

---

### assistant

Would you like me to make any additional changes to fix the i18n errors, or would you prefer to verify if the current changes have already fixed the TypeScript errors in your root.tsx file?

**Context:**
_Metadata:_ Has Context

---

### user

Caution: `i18next` also has a named export `use`. Check if you meant to write `import {use} from 'i18next'` instead.

**Context:**
_Metadata:_ Has Context

---

### assistant

⏱️ 1745727278.0s • 1/1/1970, 1:14:00 AM → 4/27/2025, 6:28:38 AM

You're right about the named export. Let's update the import statement in the config.ts file:

**Context:**
_Metadata:_ Has Context

---

### assistant

Now let's update how the i18n instance is created by using the named export:

**Context:**
_Metadata:_ Has Context

---

### assistant

Hmm, I see that the code structure is maintained but we haven't actually utilized the named `use` export that we imported. Let's correct that:

**Context:**
_Metadata:_ Has Context

---

### assistant

I see that I'm not being clear enough with my edits. Let me be more explicit:

**Context:**
_Metadata:_ Has Context

---

### assistant

I've removed the named `use` import since we're already using the method directly on the i18next instance with the method chaining pattern (i18next.use().use()). This follows the common pattern used with i18next where the default export provides all the functionality we need.

This configuration should now correctly export a properly initialized i18n instance that will work with your React components without TypeScript errors.

**Context:**
_Metadata:_ Has Context

---

### user

what do we do with the caution?

**Context:**
_Metadata:_ Has Context

---

### assistant

⏱️ 1745727251.0s • 1/1/1970, 1:15:50 AM → 4/27/2025, 6:30:01 AM

The caution message is suggesting that `i18next` has a named export `use` that we could potentially import directly. In our current code, we're accessing the `use` method through the default export with `i18next.use()`.

There are two approaches we could take:

1. Keep using the default export method as we currently are (i18next.use())
2. Import the named export and use it directly

Since our code is working correctly with the current approach and this is the common pattern for i18next configuration, we don't need to do anything with the caution. It's just an informational message suggesting an alternative way to write the code.

If you'd prefer to use the named export approach, I can make that change, but it would require restructuring how the initialization is done.

Would you like me to implement the named export approach instead, or are you satisfied with keeping the current implementation?

**Context:**
_Metadata:_ Has Context

---

### user

next, something is wrong with our redirects:app/routes/join.tsx:62:5 - error TS2322: Type 'string | null' is not assignable to type 'string'. Type 'null' is not assignable to type 'string'.62 redirectTo, ~~~~~~~~~~ app/utils/session.server.ts:75:3 75 redirectTo: string ~~~~~~~~~~ The expected type comes from property 'redirectTo' which is declared here on type '{ request: Request; userId: string; remember: boolean; redirectTo: string; }'app/routes/login.tsx:57:5 - error TS2322: Type 'string | null' is not assignable to type 'string'. Type 'null' is not assignable to type 'string'.57 redirectTo, ~~~~~~~~~~ app/utils/session.server.ts:75:3 75 redirectTo: string ~~~~~~~~~~ The expected type comes from property 'redirectTo' which is declared here on type '{ request: Request; userId: string; remember: boolean; redirectTo: string; }'

**Context:**
_Metadata:_ Has Context

---

### assistant

⏱️ 1745727269.3s • 1/1/1970, 1:17:46 AM → 4/27/2025, 6:32:15 AM

Let's fix the redirect issues. The error shows that `redirectTo` is being assigned a type of `string | null` but the function expects just `string`. Let's look at the relevant files:

**Context:**
_Metadata:_ Has Context

---

### assistant

Now I understand the issue. Let's fix the problem:

1. In `app/utils/utils.ts`, the `safeRedirect` function returns `string | null`, but in `session.server.ts`, `redirectTo` is typed as just `string`.

Let's update the `createUserSession` function in `session.server.ts` to accept `string | null` for `redirectTo` and provide a default value:

**Context:**
_Metadata:_ Has Context

---

### assistant

This should fix the TypeScript errors. Let me explain what I changed:

1. Updated the `redirectTo` parameter type in the `createUserSession` function from `string` to `string | null` to match what `safeRedirect` returns
2. Updated the redirect call to use `redirectTo || '/'` to handle the case when redirectTo is null, defaulting to the home page

These changes should resolve the TypeScript errors in both join.tsx and login.tsx files, allowing the code to compile properly.

**Context:**
_Metadata:_ Has Context

---

### user

is this anything we need to do something about?🔶 Mock server runningi18n config environment: { isTest: false, language: 'nl' }[remix-serve] http://localhost:8811 (http://192.168.1.28:8811)[PWAElements] Rendering, mounted: false hydrated: false isServer: true[PWAElements] Returning null (not ready)HEAD / 200 - - 11.118 msServer is ready, running Cypress tests...DevTools listening on ws://127.0.0.1:53986/devtools/browser/e039ce17-3c3b-4a3a-8183-134b26db9112(node:63784) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:--import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("file%3A///Users/madrus/Library/Caches/Cypress/14.3.2/Cypress.app/Contents/Resources/app/node_modules/ts-node/esm/transpile-only.mjs", pathToFileURL("./"));'(Use `node --trace-warnings ...` to show where the warning was created)(node:63784) [DEP0180] DeprecationWarning: fs.Stats constructor is deprecated.(Use `node --trace-deprecation ...` to show where the warning was created)

**Context:**
_Metadata:_ Has Context

---

### assistant

⏱️ 1745727251.9s • 1/1/1970, 1:21:42 AM → 4/27/2025, 6:35:54 AM

These logs don't indicate a problem that needs to be fixed. Let me explain what you're seeing:

1. The i18n configuration is working correctly, showing it's using 'nl' as the language.
2. The PWAElements component is functioning as expected - it's not rendering anything on the server-side, which is intentional for PWA components.
3. The server started successfully and is running on localhost:8811.
4. Cypress tests are being executed.

The warnings you see are Node.js-specific warnings about experimental features and deprecation notices:

1. `ExperimentalWarning: --experimental-loader` - This is related to Cypress using ts-node loader, which is using an experimental Node.js feature.
2. `DeprecationWarning: fs.Stats constructor is deprecated` - This is a warning about an internal Node.js API being deprecated.

These warnings don't affect your application's functionality and are related to the testing environment and tools (Cypress and ts-node). You don't need to take any action - they're informational warnings from Node.js about features that might change in future versions.

Your fixes for the i18n and redirect issues appear to be working correctly, as the application is running and ready for testing.

**Context:**
_Metadata:_ Has Context

---

### user

please remove all debug consoles that are not essential for a good working component

**Context:**
_Metadata:_ Has Context

---

### assistant

⏱️ 1745727273.9s • 1/1/1970, 1:24:38 AM → 4/27/2025, 6:39:12 AM

I'll clean up the PWAElements component by removing all the debug console logs:

**Context:**
_Metadata:_ Has Context

---

### assistant

Now let's check if there are any other debug console logs in the i18n config file that we should remove:

**Context:**
_Metadata:_ Has Context

---

### assistant

I've removed all the debug console.log statements from both files:

1. From PWAElements.tsx:
   - Removed all console.log statements related to component rendering, hydration, and mounting
   - Removed the unnecessary cleanup function that was only used for logging
   - Removed the effect that was only used for logging state changes

2. From i18n/config.ts:
   - Removed the console.log that was displaying the i18n configuration environment

I kept only the essential warning logs in the i18n configuration, as these provide important feedback when there are missing translations, which would be useful in production.

The components should work exactly the same but without cluttering the console with debug messages.

**Context:**
_Metadata:_ Has Context

---

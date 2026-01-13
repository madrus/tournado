# Playwright Testing Guide

## Overview

This guide covers our comprehensive Playwright end-to-end testing setup, featuring authentication contexts, Page Object Model (POM), and organized test structure for optimal performance and maintainability.

## 🚀 Key Features

- **Dual Authentication Contexts**: Pre-authenticated admin and user contexts
- **Page Object Model**: Structured, reusable page interactions
- **Smart Test Organization**: Proper test categorization for performance
- **Dutch Language Support**: Tests work with Dutch UI text
- **Mobile-First Testing**: Consistent mobile viewport testing

## Test Organization & Authentication Contexts

### Project Structure

Our Playwright configuration uses three projects with different authentication states:

```typescript
// playwright.config.ts
projects: [
	// Admin tests - use admin authentication context
	{
		name: 'admin-authenticated',
		use: { storageState: './playwright/.auth/admin-auth.json' },
		testMatch: ['**/admin-*.spec.ts'],
	},

	// Regular user tests - use user authentication context
	{
		name: 'user-authenticated',
		use: { storageState: './playwright/.auth/user-auth.json' },
		testMatch: ['**/menu-toggle.spec.ts', '**/user-authorization.spec.ts'],
	},

	// Public/auth flow tests - no authentication
	{
		name: 'no-auth',
		use: { storageState: { cookies: [], origins: [] } },
		testMatch: [
			'**/auth*.spec.ts',
			'**/teams.spec.ts',
			'**/navigation.spec.ts',
			'**/authorization.spec.ts',
		],
	},
]
```

### Test File Categories

#### 1. Authentication Flow Tests (`auth.spec.ts`)

**Project**: `no-auth` - Manual login required for testing flows

```typescript
// Test actual authentication flows
test('should register new user and sign in', async ({ page }) => {
	const newUser = {
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		email: createValidTestEmail(),
		password: 'MyReallyStr0ngPassw0rd!!!',
	}

	const signupPage = new SignupPage(page)
	await signupPage.register(newUser)

	const loginPage = new LoginPage(page)
	await loginPage.login(newUser.email, newUser.password)

	await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
})
```

#### 2. Admin Feature Tests (`admin-*.spec.ts`)

**Project**: `admin-authenticated` - Uses cached admin authentication

```typescript
// No manual login - uses admin-auth.json
test('should display admin teams management page', async ({ page }) => {
	await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')

	await expect(page.locator('h1').filter({ hasText: /Teams/i })).toBeVisible()
	await expect(page.locator('.container').first()).toBeVisible()
})
```

#### 3. User Permission Tests (`user-authorization.spec.ts`)

**Project**: `user-authenticated` - Uses cached user authentication

```typescript
// Tests what regular users can/cannot access
test('should be redirected from tournament creation (admin only)', async ({ page }) => {
	await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/new')

	// Regular user should be redirected to unauthorized page
	await expect(page).toHaveURL('/unauthorized')
})
```

#### 4. Public Access Tests (`authorization.spec.ts`, `teams.spec.ts`, `navigation.spec.ts`)

**Project**: `no-auth` - Tests public functionality

```typescript
// No authentication required
test('should allow access to public teams page', async ({ page }) => {
	await page.goto('/teams')

	await expect(page).toHaveURL('/teams')
	await expect(page.getByRole('link', { name: 'Toevoegen' })).toBeVisible()
})
```

## Page Object Model (POM)

### Structure

```text
playwright/
├── pages/
│   ├── BasePage.ts           # Common page functionality
│   ├── HomePage.ts           # Homepage interactions
│   ├── LoginPage.ts          # Authentication flows
│   └── SignupPage.ts         # Registration flows
├── tests/
│   ├── auth.spec.ts          # Authentication flow tests
│   ├── user-authorization.spec.ts # User permission tests
│   └── admin-*.spec.ts       # Admin feature tests
└── helpers/
    ├── database.ts           # Test user creation
    ├── global-setup.ts       # Authentication context setup
    └── test-utils.ts         # Common utilities
```

### Page Object Examples

#### BasePage.ts

```typescript
export class BasePage {
	constructor(protected page: Page) {}

	// Common navigation elements available on all pages
	get bottomNavigation(): Locator {
		return this.page.getByTestId('bottom-navigation')
	}

	get homeNavButton(): Locator {
		return this.bottomNavigation.getByRole('link', { name: /home/i })
	}

	get teamsNavButton(): Locator {
		return this.bottomNavigation.getByRole('link', { name: /teams/i })
	}

	get moreNavButton(): Locator {
		return this.bottomNavigation.getByRole('link', { name: /more/i })
	}
}
```

#### LoginPage.ts

```typescript
export class LoginPage extends BasePage {
	readonly emailInput: Locator
	readonly passwordInput: Locator
	readonly signInButton: Locator

	constructor(protected override page: Page) {
		super(page)
		this.emailInput = page.locator('#email')
		this.passwordInput = page.locator('#password')
		this.signInButton = page.getByRole('button', { name: 'Inloggen' }) // Dutch text
	}

	async login(email: string, password: string): Promise<void> {
		await this.page.goto('/auth/signin')

		// Use pressSequentially for React controlled inputs
		await this.emailInput.pressSequentially(email, { delay: 20 })
		await this.passwordInput.pressSequentially(password, { delay: 20 })

		await this.signInButton.click()
		await this.page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
	}

	async verifyAuthentication(): Promise<void> {
		const userMenuButton = this.page.getByRole('button', { name: 'Toggle menu' })
		await userMenuButton.click()

		const userDropdown = this.page.getByTestId('user-menu-dropdown')
		await userDropdown.waitFor({ state: 'visible' })
	}
}
```

#### SignupPage.ts

```typescript
export class SignupPage extends BasePage {
	async register(user: {
		firstName: string
		lastName: string
		email: string
		password: string
	}): Promise<void> {
		await this.page.goto('/auth/signup')

		await this.page
			.locator('#firstName')
			.pressSequentially(user.firstName, { delay: 20 })
		await this.page.locator('#lastName').pressSequentially(user.lastName, { delay: 20 })
		await this.page.locator('#email').pressSequentially(user.email, { delay: 20 })
		await this.page.locator('#password').pressSequentially(user.password, { delay: 20 })

		await this.page.getByRole('button', { name: 'Account aanmaken' }).click()
		await this.page.waitForURL(/\/auth\/signin/)
	}
}
```

## Authentication Context Setup

### Global Setup (`global-setup.ts`)

Creates both admin and user authentication contexts before tests run:

```typescript
async function globalSetup() {
	console.log('- cleaning database for tests...')
	await cleanDatabase()

	// Create admin user and auth context
	const adminUser = await createAdminUser()
	const adminContext = await browser.newContext()
	const adminPage = await adminContext.newPage()

	const loginPage = new LoginPage(adminPage)
	await loginPage.login(adminUser.email, 'MyReallyStr0ngPassw0rd!!!')

	await adminContext.storageState({ path: './playwright/.auth/admin-auth.json' })

	// Create regular user and auth context
	const regularUser = await createRegularUser()
	const userContext = await browser.newContext()
	const userPage = await userContext.newPage()

	await loginPage.login(regularUser.email, 'MyReallyStr0ngPassw0rd!!!')

	await userContext.storageState({ path: './playwright/.auth/user-auth.json' })

	console.log('- both authentication contexts created successfully')
}
```

### Database Helpers (`helpers/database.ts`)

```typescript
export async function createAdminUser() {
	const email = `admin-${randomString()}@test.com`

	return await prisma.user.create({
		data: {
			email,
			firebaseUid: `test-admin-${randomString()}`,
			firstName: 'Admin',
			lastName: 'User',
			role: 'ADMIN',
		},
	})
}

export async function createRegularUser() {
	const email = `user-${randomString()}@example.com`

	return await prisma.user.create({
		data: {
			email,
			firebaseUid: `test-user-${randomString()}`,
			firstName: 'Regular',
			lastName: 'User',
			role: 'PUBLIC',
		},
	})
}
```

## Best Practices

### 1. Element Selection Priority

Follow this hierarchy for robust element selection:

```typescript
// 1. By Role (best for accessibility)
page.getByRole('button', { name: 'Inloggen' })
page.getByRole('link', { name: 'Teams bekijken' })

// 2. By Label
page.getByLabel('Email')
page.getByLabel('Wachtwoord')

// 3. By Test ID (when role/label not available)
page.getByTestId('user-menu-dropdown')
page.getByTestId('bottom-navigation')

// 4. By CSS selectors (last resort)
page.locator('#email')
page.locator('.container')
```

### 2. Handling Dutch UI Text

Our application uses Dutch text, so selectors must match the actual UI:

```typescript
// ✅ Correct - matches Dutch UI
page.getByRole('button', { name: 'Inloggen' }) // Login
page.getByRole('button', { name: 'Uitloggen' }) // Logout
page.getByRole('link', { name: 'Teams bekijken' }) // View Teams
page.getByRole('link', { name: 'Toevoegen' }) // Add

// ❌ Incorrect - English text won't match
page.getByRole('button', { name: 'Login' })
page.getByRole('button', { name: 'Logout' })
```

### 3. Mobile-First Testing

All tests use mobile viewport for consistency:

```typescript
test.beforeEach(async ({ page }) => {
	// Set mobile viewport for all tests
	await page.setViewportSize({ width: 375, height: 812 })
})
```

### 4. Controlled Input Handling

For React controlled inputs, use `pressSequentially()`:

```typescript
// ✅ Works with React controlled inputs
await this.emailInput.pressSequentially(email, { delay: 20 })

// ❌ May not work with controlled inputs
await this.emailInput.fill(email)
```

### 5. Menu Interaction Patterns

Handle mobile menu interactions properly:

```typescript
async function openMobileMenu(page: Page): Promise<void> {
	// Wait for page to be fully loaded
	await page.waitForLoadState('networkidle')

	const toggleButton = page.getByRole('button', { name: 'Toggle menu' })
	await toggleButton.waitFor({ state: 'visible' })
	await toggleButton.click()

	// Wait for menu animation
	await page.waitForTimeout(500)
}
```

## Writing Tests

### Authentication Flow Test Example

```typescript
// auth.spec.ts - Tests authentication flows with manual login
test.use({ storageState: { cookies: [], origins: [] } })

test('should handle complete signin flow from homepage', async ({ page }) => {
	const testUser = await createAdminUser()
	const homePage = new HomePage(page)
	const loginPage = new LoginPage(page)

	// 1. Start from homepage
	await homePage.goto()
	await homePage.expectToBeOnHomePage()

	// 2. Navigate to signin
	await page.getByRole('button', { name: 'Toggle menu' }).click()
	await page.getByRole('link', { name: 'Inloggen' }).click()

	// 3. Login
	await loginPage.login(testUser.email, 'MyReallyStr0ngPassw0rd!!!')

	// 4. Verify authentication
	await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
	await loginPage.verifyAuthentication()
})
```

### Admin Feature Test Example

```typescript
// admin-teams.spec.ts - Uses cached admin authentication
test('should allow admin team creation', async ({ page }) => {
	// No manual login needed - uses admin-auth.json
	await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')

	await expect(page.locator('form')).toBeVisible()
	await expect(page.locator('.container').first()).toBeVisible()
})
```

### User Permission Test Example

```typescript
// user-authorization.spec.ts - Uses cached user authentication
test('should have access to admin panel', async ({ page }) => {
	// Regular users can access admin panel
	await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

	// Should stay on admin panel (not be redirected)
	await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
})
```

## Running Tests

### All Tests

```bash
pnpm test:e2e:all
```

### Specific Project

```bash
# Admin tests only
npx playwright test --project admin-authenticated

# User tests only
npx playwright test --project user-authenticated

# Auth flow tests only
npx playwright test --project no-auth
```

### Specific Test File

```bash
# Authentication flows
npx playwright test auth.spec.ts

# Admin features
npx playwright test admin-teams.spec.ts

# User permissions
npx playwright test user-authorization.spec.ts
```

### Development Mode

```bash
# Run with browser visible
npx playwright test --headed

# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui
```

## Troubleshooting

### Common Issues

#### 1. Form Fields Being Cleared

**Problem**: Input fields become empty after filling
**Solution**: Use `pressSequentially()` instead of `fill()` for controlled inputs

```typescript
// ✅ Works with controlled inputs
await input.pressSequentially(value, { delay: 20 })

// ❌ May not work with controlled inputs
await input.fill(value)
```

#### 2. Menu Not Opening

**Problem**: Mobile menu doesn't respond to clicks
**Solution**: Add proper wait conditions

```typescript
// ✅ Robust menu interaction
await page.waitForLoadState('networkidle')
const toggleButton = page.getByRole('button', { name: 'Toggle menu' })
await toggleButton.waitFor({ state: 'visible' })
await toggleButton.click()
await page.waitForTimeout(500) // Allow animation
```

#### 3. Authentication Context Not Working

**Problem**: Tests fail with authentication errors despite using auth contexts
**Solution**: Check test file matching patterns in `playwright.config.ts`

```typescript
// Ensure test files match the correct project patterns
// admin-authenticated: **/admin-*.spec.ts
// user-authenticated: **/user-authorization.spec.ts, **/menu-toggle.spec.ts
// no-auth: **/auth*.spec.ts, **/teams.spec.ts, etc.
```

#### 4. Dutch Text Selectors Not Working

**Problem**: Element selectors fail to find Dutch UI text
**Solution**: Use exact Dutch text from the UI

```typescript
// ✅ Check actual UI text
await page.screenshot() // Take screenshot to see actual text
page.getByRole('button', { name: 'Inloggen' }) // Use exact Dutch text
```

### Debugging Tips

1. **Take Screenshots**: Add `await page.screenshot()` to see current state
2. **Check Console Logs**: Use `page.on('console', console.log)` for browser logs
3. **Verify Element Text**: Use `await element.textContent()` to check actual text
4. **Check URL**: Use `console.log(page.url())` to verify navigation
5. **Use Playwright Inspector**: Run with `--debug` flag for step-by-step debugging

## Performance Benefits

Our authentication context setup provides significant performance improvements:

### Before: Manual Login Every Test

- Every test performs full login flow
- Database queries for every authentication
- Slow test execution (30+ seconds per test)
- Excessive network requests in logs

### After: Cached Authentication

- Admin tests use `admin-auth.json` (instant authentication)
- User tests use `user-auth.json` (instant authentication)
- Auth flow tests only perform manual login when testing those flows
- Fast test execution (5-10 seconds per test)
- Clean logs with minimal authentication noise

This setup **eliminates excessive login requests** while maintaining comprehensive test coverage.

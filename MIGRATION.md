# Migration Plan: Secure Admin Role Management & Environment Validation

## Overview

This migration addresses two critical issues:

1. **Dynamic Admin Role Assignment** - Roles update on every login based on `SUPER_ADMIN_EMAILS`
2. **Environment Variable Validation** - Ensure all required vars are configured per environment

## Target Admin Configuration

| Email                    | Auth Method    | Role    | Environment              |
| ------------------------ | -------------- | ------- | ------------------------ |
| `admin1@example.com`       | Google OAuth   | ADMIN   | All                      |
| `admin2@example.com` | Email/Password | ADMIN   | All                      |
| `user@example.com`   | Email/Password | MANAGER | All (demoted from ADMIN) |

---

## Phase 1: Local Development & Testing

### 1.1: Code Changes

- [x] Update `app/features/firebase/server.ts`
   - [x] Add `currentRole` parameter to `assignUserRole` function
   - [x] Implement demotion logic: ADMIN → MANAGER when removed from SUPER_ADMIN_EMAILS
   - [x] Line 139-172: Add role reassignment for existing users (by firebaseUid)
   - [x] Line 184-223: Add role reassignment for existing users (by email)
   - [x] Optimize: Only update role if it has changed (avoid unnecessary DB writes)
- [x] Update `scripts/migrate-admin-roles.ts` - demote to MANAGER instead of PUBLIC
- [x] Update `scripts/validate-env.ts` - finalize required vars per context
- [x] Add `migrate:admin-roles` and `env:check:*` scripts to `package.json`

### 1.2: Update Local Environment

- [x] Update `.env` file:
   ```bash
   SUPER_ADMIN_EMAILS="admin1@example.com,admin2@example.com"
   ```

### 1.3: Test Locally

- [x] Run migration: `SUPER_ADMIN_EMAILS="admin1@example.com,admin2@example.com" pnpm migrate:admin-roles`
   - ⚠️ Note: Script demotes to MANAGER (not PUBLIC anymore)
   - Fixed: Set `user@example.com` to MANAGER via Prisma Studio
- [x] Test login: `admin1@example.com` (Google) → verify ADMIN ✅
- [x] Test login: `user@example.com` (email/password) → verify MANAGER ✅
- [x] Test login: `admin2@example.com` (email/password) → verify ADMIN ✅
   - Created via sign-up, automatically assigned ADMIN role based on SUPER_ADMIN_EMAILS
- [x] Verify admin panel access works correctly
- [x] **Important**: Restart dev server completely to pick up .env changes (may need to kill port 5173)

### 1.4: Validate E2E Tests Pass

- [x] Run E2E tests: `pnpm test:e2e`
- [x] Ensure all tests pass with updated code ✅

---

## Phase 2: Documentation Updates

### 2.1: Create ADR

- [x] Create `.cursor/rules/adr-003-dynamic-admin-roles.mdc`
- [x] Document architectural decision for dynamic role assignment
- [x] Explain why roles update on every login

### 2.2: Update Environment Documentation

- [x] Update `docs/environment-variables.md`
   - [x] Add admin role management section
   - [x] Document `SUPER_ADMIN_EMAILS` behavior per environment

### 2.3: Update Project Instructions

- [x] Update `CLAUDE.md` if needed
   - [x] Add note about dynamic admin role assignment (not needed - well documented in ADR and env docs)

---

## Phase 3: Staging Deployment

### 3.1: Update Staging Secrets

- [x] Update Fly.io secrets:
   ```bash
   fly secrets set SUPER_ADMIN_EMAILS="admin1@example.com,admin2@example.com" --app tournado-staging
   ```

### 3.2: Deploy to Staging

- [x] Deploy code to staging (deployed from dev branch via CI)
- [x] Run migration on staging:
   ```bash
   fly ssh console --app tournado-staging -C "pnpm migrate:admin-roles"
   ```

### 3.3: Test on Staging

- [x] Login with `admin1@example.com` → verify ADMIN role
- [x] Login with `user@example.com` → verify MANAGER role (demoted)
- [x] Login with `admin2@example.com` → verify ADMIN role
- [x] Test admin panel access
- [x] Test team management features
- [x] Test tournament creation

### 3.4: Validate Environment

- [x] Environment validated via manual testing (scripts not deployed to production environment)

---

## Phase 4: Production Deployment

**⚠️ Prerequisites: Merge PR to `main` branch first**

### 4.0: Merge to Main

- [ ] Create PR from `dev` to `main` with all changes
- [ ] Review and approve PR
- [ ] Merge PR to `main`
- [ ] Wait for CI deployment to production to complete

### 4.1: Update Production Secrets

- [ ] Update Fly.io secrets:
   ```bash
   fly secrets set SUPER_ADMIN_EMAILS="admin1@example.com,admin2@example.com" --app tournado
   ```

### 4.2: Verify Production Deployment

- [ ] Confirm deployment from main branch completed successfully
- [ ] Check deployment status: `fly status --app tournado`

### 4.3: Run Migration

- [ ] Run migration on production:
   ```bash
   fly ssh console --app tournado -C "pnpm migrate:admin-roles"
   ```

### 4.4: Test on Production

- [ ] Login with `admin1@example.com` → verify ADMIN role
- [ ] Login with `user@example.com` → verify MANAGER role
- [ ] Login with `admin2@example.com` → verify ADMIN role
- [ ] Verify all critical functionality works

### 4.5: Validate Environment

- [ ] Run environment validation:
   ```bash
   fly ssh console --app tournado -C "pnpm env:check:prod"
   ```

---

## Phase 5: CI/E2E Environment Validation

### 5.1: Update GitHub Secrets

- [ ] Verify GitHub Secrets exist (Settings > Secrets > Actions):
   - [ ] `DATABASE_URL`
   - [ ] `SESSION_SECRET`
   - [ ] `FIREBASE_ADMIN_PROJECT_ID`
   - [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
   - [ ] `FIREBASE_ADMIN_PRIVATE_KEY`
   - [ ] `SUPER_ADMIN_EMAILS` (can be dummy value like "test@example.com")
   - [ ] `SUPER_ADMIN_PASSWORD`

### 5.2: Add Environment Validation to Workflows

- [ ] Update `.github/workflows/ci.yml`
   - [ ] Add validation step before tests
- [ ] Update `.github/workflows/playwright-reusable.yml`
   - [ ] Add validation step before E2E tests

### 5.3: Fix Immediate E2E Issue

- [ ] Verify fix in `app/features/firebase/hooks/useFirebaseAuth.ts`
   - [ ] Ensure `loading=false` when Firebase not configured (already done)

### 5.4: Verify CI/E2E Pass

- [ ] Push to trigger CI workflow
- [ ] Verify all CI tests pass
- [ ] Trigger manual E2E workflow
- [ ] Verify all E2E tests pass

---

## Environment Variable Matrix (Final)

| Variable                            | CI   | E2E  | Local | Staging | Production |
| ----------------------------------- | ---- | ---- | ----- | ------- | ---------- |
| `DATABASE_URL`                      | ✅   | ✅   | ✅    | ✅      | ✅         |
| `SESSION_SECRET`                    | ✅   | ✅   | ✅    | ✅      | ✅         |
| `FIREBASE_ADMIN_PROJECT_ID`         | ✅   | ✅   | ✅    | ✅      | ✅         |
| `FIREBASE_ADMIN_CLIENT_EMAIL`       | ✅   | ✅   | ✅    | ✅      | ✅         |
| `FIREBASE_ADMIN_PRIVATE_KEY`        | ✅   | ✅   | ✅    | ✅      | ✅         |
| `SUPER_ADMIN_EMAILS`                | ✅\* | ✅\* | ✅    | ✅      | ✅         |
| `SUPER_ADMIN_PASSWORD`              | ✅   | ✅   | ✅    | ✅      | ✅         |
| `VITE_FIREBASE_API_KEY`             | ❌   | ❌   | ✅    | ✅      | ✅         |
| `VITE_FIREBASE_AUTH_DOMAIN`         | ❌   | ❌   | ✅    | ✅      | ✅         |
| `VITE_FIREBASE_PROJECT_ID`          | ❌   | ❌   | ✅    | ✅      | ✅         |
| `VITE_FIREBASE_STORAGE_BUCKET`      | ❌   | ❌   | ✅    | ✅      | ✅         |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ❌   | ❌   | ✅    | ✅      | ✅         |
| `VITE_FIREBASE_APP_ID`              | ❌   | ❌   | ✅    | ✅      | ✅         |
| `VITE_FIREBASE_MEASUREMENT_ID`      | ❌   | ❌   | ✅    | ✅      | ✅         |
| `RESEND_API_KEY`                    | ❌   | ❌   | ✅    | ✅      | ✅         |
| `EMAIL_FROM`                        | ❌   | ❌   | ✅    | ✅      | ✅         |
| `BASE_URL`                          | ❌   | ❌   | ✅    | ✅      | ✅         |

\*CI/E2E can use dummy value or empty string (fallback to `[]`)

---

## Execution Order

1. ✅ **Local**: Code changes + testing
2. ✅ **Docs**: Update ADR + environment docs
3. ✅ **Staging**: Deploy + migrate + test
4. ✅ **Production**: Deploy + migrate + test
5. ✅ **CI/E2E**: Validate environment + verify tests pass

---

## Rollback Plan

If issues occur in production:

1. **Revert Admin Emails:**

   ```bash
   fly secrets set SUPER_ADMIN_EMAILS="user@example.com,admin2@example.com" --app tournado
   ```

2. **Revert Code (if deployed):**

   ```bash
   # Rollback via Fly.io
   fly releases rollback --app tournado
   ```

3. **Manual Database Fix (if needed):**
   ```bash
   fly ssh console --app tournado
   npx prisma studio
   # Manually update roles in User table
   ```

---

## Success Criteria

- ✅ `admin1@example.com` has ADMIN role via Google OAuth
- ✅ `user@example.com` has MANAGER role (demoted from ADMIN)
- ✅ `admin2@example.com` has ADMIN role via email/password
- ✅ Adding/removing emails from `SUPER_ADMIN_EMAILS` updates roles on next login
- ✅ All environments have required variables configured
- ✅ Environment validation scripts pass in all contexts
- ✅ All CI and E2E tests pass
- ✅ Documentation updated with new admin management process

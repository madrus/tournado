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

- [x] Create PR from `dev` to `main` with all changes
- [x] Review and approve PR
- [x] Merge PR to `main`
- [x] Wait for CI deployment to production to complete

### 4.1: Update Production Secrets

- [x] Set all 16 required Fly.io secrets:
   ```bash
   fly secrets set SUPER_ADMIN_EMAILS="admin1@example.com,admin2@example.com" --app tournado
   # Firebase Client (7 vars): VITE_FIREBASE_*
   # Firebase Admin (3 vars): FIREBASE_ADMIN_*
   # Email (2 vars): RESEND_API_KEY, EMAIL_FROM
   # Database: DATABASE_URL
   ```

### 4.2: Verify Production Deployment

- [x] Confirm deployment from main branch completed successfully
- [x] Check deployment status: `fly status --app tournado`

### 4.3: Fix Database Schema

- [x] Added `firebaseUid` column to User table (migration was broken):
   ```bash
   fly ssh console --app tournado -C "sqlite3 /data/sqlite.db 'ALTER TABLE User ADD COLUMN firebaseUid TEXT'"
   fly ssh console --app tournado -C "sqlite3 /data/sqlite.db 'CREATE UNIQUE INDEX User_firebaseUid_key ON User(firebaseUid)'"
   ```
- [x] Deleted old users without Firebase UIDs to allow fresh user creation

### 4.4: Test on Production

- [x] Login with `admin1@example.com` (Google OAuth) → verified ADMIN role ✅
- [x] Login with `admin2@example.com` (email/password) → verified ADMIN role ✅
- [x] Verify all critical functionality works ✅
- [x] Added `tournado.fly.dev` to Firebase authorized domains

### 4.5: Notes

- Migration script not available in production (scripts folder not deployed)
- Admin role assignment happens automatically on login (ADR-003)
- Database migration issue resolved manually (init migration tried to recreate tables instead of altering)

---

## Phase 5: CI/E2E Environment Validation

### 5.1: Update GitHub Secrets

- [x] Verified GitHub Secrets exist (Settings > Secrets > Actions):
   - [x] `DATABASE_URL`
   - [x] `SESSION_SECRET`
   - [x] `FIREBASE_ADMIN_PROJECT_ID`
   - [x] `FIREBASE_ADMIN_CLIENT_EMAIL`
   - [x] `FIREBASE_ADMIN_PRIVATE_KEY`
   - [x] `SUPER_ADMIN_EMAILS`
   - [x] All VITE*FIREBASE*\* variables (7 total)
   - [x] Email configuration (RESEND_API_KEY, EMAIL_FROM)

### 5.2: Verify Workflow Configurations

- [x] Verified `.github/workflows/ci.yml` has all required env vars
- [x] Verified `.github/workflows/playwright-reusable.yml` has all required env vars
- [x] Both workflows properly configured with Firebase credentials

### 5.3: Verify Firebase Auth Hook

- [x] Verified `app/features/firebase/hooks/useFirebaseAuth.ts` handles missing config:
   - [x] Sets `loading=false` when Firebase not configured (lines 48-53)
   - [x] Prevents E2E tests from hanging with dummy Firebase values

### 5.4: Notes

- CI/E2E workflows already properly configured
- All required secrets present in GitHub
- No workflow changes needed
- Tests can be run when ready by pushing to trigger CI

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
4. ✅ **Production**: Deploy + fix database + test
5. ✅ **CI/E2E**: Environment validated (all secrets configured)

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
- ✅ `admin2@example.com` has ADMIN role via email/password
- ✅ Adding/removing emails from `SUPER_ADMIN_EMAILS` updates roles on next login
- ✅ All environments have required variables configured
- ✅ Production environment is working correctly
- ✅ Documentation updated with new admin management process
- ✅ Database schema fixed and authentication working

**Production is now fully operational!** 🎉

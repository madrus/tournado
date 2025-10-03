# Production Migration - October 2025

## Overview

This document summarizes the production deployment and migration completed in October 2025, which finalized Phase 1 of the Authentication Modernization project.

## Migration Summary

**Date**: October 1-2, 2025
**Status**: ✅ Completed
**Scope**: Production Firebase environment configuration and database migration

## What Was Accomplished

### 1. Environment Configuration ✅

Configured all 16 required environment variables in production (`tournado` Fly.io app):

**Core Configuration:**

- `SESSION_SECRET` (already configured)
- `BASE_URL` (already configured)
- `SUPER_ADMIN_EMAILS` = "madrus@gmail.com,otmanabdel@hotmail.com"
- `DATABASE_URL` = "file:/data/sqlite.db?connection_limit=1"

**Firebase Client (7 variables):**

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN` = "tournado-prod.firebaseapp.com"
- `VITE_FIREBASE_PROJECT_ID` = "tournado-prod"
- `VITE_FIREBASE_STORAGE_BUCKET` = "tournado-prod.firebasestorage.app"
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` = "G-S337BW4VYB"

**Firebase Admin (3 variables):**

- `FIREBASE_ADMIN_PROJECT_ID` = "tournado-prod"
- `FIREBASE_ADMIN_CLIENT_EMAIL` (service account)
- `FIREBASE_ADMIN_PRIVATE_KEY` (service account)

**Email Configuration (2 variables):**

- `RESEND_API_KEY`
- `EMAIL_FROM` = "Team Registration <onboarding@resend.dev>"

### 2. Database Schema Migration ✅

**Issue Discovered**: Production database was missing the `firebaseUid` column in the User table, causing authentication failures.

**Root Cause**: Migration history issue - the `20250909145006_init` migration attempted to CREATE tables instead of ALTER existing tables, indicating the migrations folder had been deleted and regenerated at some point.

**Resolution**:

```sql
-- Manual migration applied to production database
ALTER TABLE User ADD COLUMN firebaseUid TEXT;
CREATE UNIQUE INDEX User_firebaseUid_key ON User(firebaseUid);
```

**Data Cleanup**: Deleted old users without Firebase UIDs to allow fresh user creation with proper Firebase authentication.

### 3. Firebase Configuration ✅

- Added `tournado.fly.dev` to Firebase authorized domains
- Configured `tournado-prod` Firebase project for production use
- Verified Google OAuth and Email/Password authentication working

### 4. Admin Role Assignment ✅

**Dynamic Admin Roles (ADR-003)**: Implemented automatic admin role assignment based on `SUPER_ADMIN_EMAILS` environment variable.

**Current Admin Users:**

- `madrus@gmail.com` - ADMIN (Google OAuth)
- `otmanabdel@hotmail.com` - ADMIN (Email/Password)

**How It Works:**

- Roles update automatically on every login
- Users in `SUPER_ADMIN_EMAILS` get ADMIN role
- Removed users get demoted to MANAGER (not PUBLIC)
- No manual database updates needed

### 5. CI/E2E Environment Validation ✅

**GitHub Secrets Verified:**

- All 6 required Firebase secrets configured
- All 7 VITE*FIREBASE*\* variables present
- Email, database, and session secrets configured

**Workflows Verified:**

- `.github/workflows/ci.yml` - all env vars configured
- `.github/workflows/playwright-reusable.yml` - all env vars configured
- Firebase auth hook handles missing config gracefully

## Lessons Learned

### Migration Issues Encountered

1. **Migration History Corruption**
   - **Issue**: Init migration tried to CREATE instead of ALTER tables
   - **Cause**: Migrations folder was likely deleted and regenerated
   - **Resolution**: Manual SQL commands to add missing column
   - **Prevention**: Never delete migrations folder; always use proper migration workflows

2. **Old User Data**
   - **Issue**: Existing users had NULL firebaseUid values
   - **Impact**: Authentication failed for all users
   - **Resolution**: Deleted old users, allowing fresh creation with Firebase UIDs
   - **Prevention**: Include data migration scripts when schema changes

3. **Firebase Domain Configuration**
   - **Issue**: `auth/unauthorized-domain` error on first login attempt
   - **Resolution**: Added `tournado.fly.dev` to Firebase authorized domains
   - **Prevention**: Document required Firebase console configuration

### Best Practices Established

1. **Environment Variables**
   - Use individual `flyctl secrets set` commands (more reliable than batch scripts)
   - Verify all secrets with `fly secrets list`
   - Document all 16 required variables

2. **Database Migrations**
   - Always check schema before running migrations
   - Use manual SQL for emergency fixes in production
   - Document migration issues for future reference

3. **Firebase Configuration**
   - Maintain separate Firebase projects per environment
   - Configure authorized domains before testing
   - Document service account setup process

## Files Modified

### Documentation

- `MIGRATION.md` - Updated with Phase 4 and Phase 5 completion status
- `.cursor/rules/PRD.mdc` - Updated Phase 1 completion checklist
- `docs/deployment/production-migration-2025-10.md` - This document (new)

### Configuration

- Production Fly.io secrets (16 environment variables configured)
- Firebase `tournado-prod` project (authorized domains, service account)
- Production database schema (firebaseUid column added)

## References

- **Migration Plan**: [MIGRATION.md](../../MIGRATION.md)
- **Environment Variables**: [environment-variables.md](../environment-variables.md)
- **ADR-003**: [Dynamic Admin Role Assignment](../../.cursor/rules/adr-003-dynamic-admin-roles.mdc)
- **Authentication Guide**: [authentication.md](../development/authentication.md)

## Production Status

**Production URL**: https://tournado.fly.dev

**Deployment**:

- Version: 128 (as of Oct 2, 2025)
- Region: Amsterdam (ams)
- Status: ✅ Running and healthy

**Authentication**:

- ✅ Google OAuth working
- ✅ Email/Password working
- ✅ Admin roles assigned correctly
- ✅ Session management functional

**Next Steps**:

- Monitor production for any issues
- Begin Phase 2: Groups & Playoffs (MVP)
- Consider implementing proper database migration workflow to prevent future schema issues

---

**Migration completed successfully on October 2, 2025** 🎉

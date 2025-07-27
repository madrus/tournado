# Security Overview

This document outlines the security measures implemented in the Tournado application to protect against common attacks and ensure safe operation for administrators and users.

## Rate Limiting

To protect against brute force attacks and abuse, the application implements comprehensive rate limiting across critical endpoints.

### Implementation

Rate limiting is implemented using an in-memory store with automatic cleanup and configurable limits per endpoint type.

**Core Components:**

- `app/utils/rateLimit.server.ts` - Core rate limiting utility
- `app/utils/adminMiddleware.server.ts` - Admin-specific middleware
- IP detection with proxy awareness (X-Forwarded-For, CF-Connecting-IP)

### Protection Levels

#### Admin Login (`/auth/signin`)

- **Limit**: 5 attempts per 15 minutes
- **Block Duration**: 30 minutes after limit exceeded
- **Purpose**: Prevent brute force password attacks

```ts
// Implementation in auth.signin.tsx
const rateLimitResult = checkRateLimit(`login:${clientIP}`, RATE_LIMITS.ADMIN_LOGIN)
```

#### Admin Actions (General)

- **Limit**: 30 requests per 5 minutes
- **Block Duration**: 10 minutes after limit exceeded
- **Purpose**: Prevent admin panel abuse and automated attacks

```ts
// Usage in admin routes
export const action = async ({ request }) => {
   return withAdminRateLimit(request, async () => {
      // Your admin logic here
      return Response.json({ success: true })
   })
}
```

#### Sensitive Admin Operations

- **Limit**: 10 requests per 5 minutes
- **Block Duration**: 15 minutes after limit exceeded
- **Purpose**: Extra protection for user management, data deletion
- **Use Cases**: User creation/deletion, bulk operations, sensitive data modifications

```ts
// Usage for sensitive operations
export const action = async ({ request }) => {
   return withAdminSensitiveRateLimit(request, async () => {
      // Sensitive admin operation
      await deleteUser(userId)
      return Response.json({ success: true })
   })
}
```

### Rate Limit Headers

All rate-limited responses include standard headers:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1641024000
Retry-After: 1800
```

### Configuration

Rate limits are configured in `RATE_LIMITS` constant:

```ts
export const RATE_LIMITS = {
   ADMIN_LOGIN: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 30 * 60 * 1000, // 30 minutes block
   },
   ADMIN_ACTIONS: {
      maxAttempts: 30,
      windowMs: 5 * 60 * 1000, // 5 minutes
      blockDurationMs: 10 * 60 * 1000, // 10 minutes block
   },
   USER_REGISTRATION: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours block
   },
}
```

## Authentication & Authorization

### Admin Panel Protection

The admin panel uses a secure, obfuscated URL pattern (`/a7k9m2x5p8w1n4q6r3y8b5t1`) to prevent discovery through URL enumeration.

### Session Management

- Secure session cookies with HTTP-only flag
- Configurable session duration with "Remember Me" option
- Automatic session invalidation on logout

## Input Validation & XSS Prevention

### Form Data Validation

All form inputs are validated both client-side and server-side:

- Email validation using regex patterns
- Password strength requirements (minimum 8 characters)
- Input sanitization before database operations

### XSS Protection

- Use of `JSON.stringify()` for safe data serialization to client
- Proper HTML escaping in templates
- CSP headers recommended for additional protection

```ts
// Safe data passing to client
dangerouslySetInnerHTML={{
  __html: `window.__SSR_LANGUAGE__ = ${JSON.stringify(language)};`
}}
```

## Database Security

### Query Protection

- Use of Prisma ORM prevents SQL injection attacks
- Parameterized queries for all database operations
- Input validation before database queries

### Data Access Control

- User-based access control for admin operations
- Role-based permissions (admin vs regular user)
- Protected routes with authentication middleware

## Production Considerations

### Environment Variables

Sensitive configuration stored in environment variables:

```bash
DATABASE_URL=postgresql://...
SESSION_SECRET=random-secret-key
```

### Additional Recommended Measures

1. **Content Security Policy (CSP)** headers
2. **HTTPS** enforcement in production
3. **Security headers** (HSTS, X-Frame-Options, etc.)
4. **Regular dependency updates** to patch vulnerabilities
5. **Database connection encryption**
6. **API rate limiting** at infrastructure level (Cloudflare, etc.)

## Monitoring & Alerting

Consider implementing:

- Failed login attempt monitoring
- Rate limit breach alerts
- Unusual admin activity detection
- Database query performance monitoring

## Future Enhancements

Potential security improvements:

1. **Two-Factor Authentication (2FA)** for admin accounts
2. **Redis-based rate limiting** for multi-instance deployments
3. **Audit logging** for admin actions
4. **IP whitelisting** for admin access
5. **Automated security scanning** in CI/CD pipeline

---

> **Note**: This security implementation provides a solid foundation for a tournament management application. Regularly review and update security measures as the application evolves and new threats emerge.

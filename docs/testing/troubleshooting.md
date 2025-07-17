# Troubleshooting

## Common Issues

### Deployment Issues

1. **Failed Deployments**
   - Check Fly.io logs: `fly logs --app tournado`
   - Verify secrets are set: `fly secrets list --app tournado`
   - Check machine status: `fly machines list --app tournado`

2. **Database Connection Issues**
   - Verify volume status: `fly volumes list --app tournado`
   - Check database file permissions
   - Ensure database is properly initialized

### Development Issues

1. **Build Failures**
   - Clear node_modules: `rm -rf node_modules`
   - Clear pnpm cache: `pnpm store prune`
   - Reinstall dependencies: `pnpm install`

2. **Test Failures**
   - Check database connection
   - Verify test environment variables
   - Ensure test database is clean

3. **Language Flash of Unstyled/Incorrect Content (FOUC)**

   **Problem:**
   - On initial page load, users would sometimes see the wrong language (e.g., English instead of Dutch or Arabic) for a brief moment before the correct language was applied. This is known as a Flash of Untranslated Content (FOUC).
   - This happened because the language was determined only on the client side, after hydration, so the server-rendered HTML was always in the default language.

   **Why it happened:**
   - The server did not know the user's preferred language (from cookie, header, or localStorage) at render time, so it always rendered the default language.
   - When the client-side JavaScript loaded, it would detect the correct language and re-render, causing a visible "flash" as the content switched.

   **Solution:**
   - The language detection logic was moved to the server side. Now, the server reads the user's language preference (from cookie, Accept-Language header, or other means) during the initial request.
   - The server initializes i18n with the correct language before rendering the HTML, so the user sees the correct language immediately, with no flash.
   - The client-side i18n instance is also initialized with the same language, ensuring consistency and no mismatch during hydration.

   **Result:**
   - The FOUC is eliminated. Users always see the correct language from the very first paint, both on the server and client.
   - This approach is robust for SSR/Remix/React Router apps and is recommended for all internationalized apps.

   **Troubleshooting:**
   - If you see a language flash again, check that the server-side language detection is working and that the language is passed to both the server and client i18n initialization.
   - Make sure cookies or headers are being sent correctly from the browser to the server.

### Test Database Issues

1. **E2E Test Database Connection Problems**

   **Symptoms**: Tests fail with database connection errors

   **Solutions**:

   ```sh
   # Verify test database exists and is accessible
   ls -la prisma/data-test.db

   # Check test database can be opened
   sqlite3 prisma/data-test.db ".tables"

   # Run E2E tests through the proper script (auto-manages test DB)
   pnpm test:e2e:all
   ```

2. **Development vs Test Database Confusion**

   **Problem**: Accidentally working with the wrong database

   **Identification**:
   - Development database: `prisma/data.db`
   - Test database: `prisma/data-test.db` (auto-managed by E2E tests)

   **Solutions**:

   ```sh
   # Check which database Prisma Studio is using
   echo $DATABASE_URL

   # Force development database connection
   unset DATABASE_URL
   pnpm prisma studio

   # Force test database connection
   DATABASE_URL="file:./prisma/data-test.db?connection_limit=1" pnpm prisma studio
   ```

3. **Test Database Not Auto-Created**

   **Symptoms**: E2E tests fail because test database doesn't exist

   **Solutions**:

   ```sh
   # Always run E2E tests via the proper commands
   pnpm test:e2e:all    # Headless mode (starts server)
   pnpm test:e2e:dev    # Interactive mode

   # Avoid running Playwright directly (bypasses database setup)
   # ❌ Don't do: npx playwright test
   # ✅ Do: pnpm test:e2e:all
   ```

4. **Stale Test Data Issues**

   **Problem**: Tests fail due to unexpected data state

   **Solution**: Test database is automatically recreated fresh for each test run. If issues persist:

   ```sh
   # Manually remove test database and let it be recreated
   rm -f prisma/data-test.db
   pnpm test:e2e:all
   ```

## Debugging Tools

### Fly.io Debugging

```sh
# View application logs
fly logs --app tournado

# SSH into the application
fly ssh console --app tournado

# Check machine status
fly machines list --app tournado

# View secrets
fly secrets list --app tournado
```

### Local Development

```sh
# Check database status
pnpm db:status

# Reset database
pnpm db:reset

# View development logs
pnpm dev:logs
```

## Performance Issues

1. **Slow Database Queries**
   - Check query execution plans
   - Add appropriate indexes
   - Optimize database schema

2. **High Memory Usage**
   - Monitor memory usage in Fly.io dashboard
   - Check for memory leaks
   - Optimize resource-intensive operations

## Getting Help

If you encounter issues that aren't covered in this guide:

1. Check the [Fly.io documentation](https://fly.io/docs/)
2. Visit the [Fly.io community](https://community.fly.io/)
3. Review the [React Router v7 documentation](https://reactrouter.com/docs)
4. Check GitHub issues for similar problems

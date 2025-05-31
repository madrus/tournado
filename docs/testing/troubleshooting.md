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
   pnpm test:e2e:run
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
   pnpm test:e2e:run    # Headless mode
   pnpm test:e2e:dev    # Interactive mode

   # Avoid running Cypress directly (bypasses database setup)
   # ❌ Don't do: npx cypress run
   # ✅ Do: pnpm test:e2e:run
   ```

4. **Stale Test Data Issues**

   **Problem**: Tests fail due to unexpected data state

   **Solution**: Test database is automatically recreated fresh for each test run. If issues persist:

   ```sh
   # Manually remove test database and let it be recreated
   rm -f prisma/data-test.db
   pnpm test:e2e:run
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
3. Review the [Remix documentation](https://remix.run/docs)
4. Check GitHub issues for similar problems

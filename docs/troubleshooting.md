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

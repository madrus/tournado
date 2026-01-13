# Docker Native Dependencies

## Problem: Native Node Modules in Production Builds

When deploying Node.js applications with native modules (like `better-sqlite3`) to Docker containers, several challenges arise that don't occur in local development.

## The Challenges We Faced

### Challenge 1: Husky Git Hooks in Docker

**Problem**: Installing dependencies normally triggers postinstall scripts, including Husky's git hook setup.

**Error**:

```bash
sh: 1: husky: not found
ELIFECYCLE Command failed
```

**Why it fails**:

- Husky tries to install git hooks during `pnpm install`
- Docker containers don't have Husky CLI available globally
- The postinstall script runs `husky &&` which fails before `|| true` can catch it

**Solution**: Use `--ignore-scripts` flag to skip all postinstall hooks:

```dockerfile
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
```

### Challenge 2: Native Module Compilation

**Problem**: Native modules like `better-sqlite3` need to be compiled for the target platform (Linux in Docker).

**Error**:

```bash
Error: Could not locate the bindings file. Tried:
  → /workdir/node_modules/better-sqlite3/build/Release/better_sqlite3.node
  [... 12 more paths ...]
```

**Why it fails**:

- `better-sqlite3` is a native C++ addon that must be compiled with node-gyp
- Using `--ignore-scripts` prevents the build script from running
- Simply installing the package doesn't compile the native bindings

**Failed approaches**:

1. ❌ **Remove `--ignore-scripts`**: Husky fails and breaks the build
2. ❌ **Use `pnpm rebuild better-sqlite3`**: Doesn't work because `--ignore-scripts` doesn't download source code needed for rebuild
3. ❌ **Copy pre-built bindings from deps stage**: Deps stage also didn't have bindings built

### Challenge 3: Version-Agnostic Solutions

**Problem**: Hardcoding version numbers in Dockerfile paths creates maintenance burden.

**Example of bad approach**:

```dockerfile
# ❌ WRONG - hardcoded version breaks on upgrades
COPY --from=deps /workdir/node_modules/.pnpm/better-sqlite3@12.4.6/...
```

**Solution**: Use dynamic resolution with `find`:

```dockerfile
# ✅ CORRECT - works across version upgrades
RUN SQLITE_DIR=$(find /workdir/node_modules/.pnpm -type d -name "better-sqlite3" -path "*/node_modules/better-sqlite3" | head -1)
```

## The Complete Solution

### 1. Add Build Tools to Base Image

Native modules need C++ compilers and build tools:

```dockerfile
FROM node:22-bullseye-slim AS base

# Install build tools for native modules
RUN apt-get update && apt-get install -y \
  openssl \
  sqlite3 \
  python3 \
  python3-pip \
  build-essential \
  && npm install -g pnpm@10 \
  && pip3 install litecli \
  && rm -rf /var/lib/apt/lists/*
```

**What `build-essential` provides**:

- `gcc` - GNU C compiler
- `g++` - GNU C++ compiler
- `make` - Build automation tool
- Other essential build tools

### 2. Install Dependencies with `--ignore-scripts`

This avoids Husky failures while installing packages:

```dockerfile
FROM base AS production-deps

WORKDIR /workdir

ENV DATABASE_URL=file:/data/sqlite.db

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install without running any lifecycle scripts
RUN pnpm install --prod --frozen-lockfile --ignore-scripts && \
  pnpm install prisma @prisma/client --ignore-scripts && \
  pnpm prisma generate
```

### 3. Manually Build Native Modules

Find the package directory dynamically and run its build script:

```dockerfile
# Build better-sqlite3 native bindings manually
# Find the better-sqlite3 directory and run its build script directly
RUN SQLITE_DIR=$(find /workdir/node_modules/.pnpm -type d -name "better-sqlite3" -path "*/node_modules/better-sqlite3" | head -1) && \
  cd "$SQLITE_DIR" && \
  npm run build-release
```

**How this works**:

1. `find` locates the better-sqlite3 package in pnpm's `.pnpm` store (version-agnostic)
2. `cd "$SQLITE_DIR"` changes to the package directory
3. `npm run build-release` runs the package's build script (invokes node-gyp)
4. node-gyp compiles the C++ source code to a `.node` binary

**Build output (success)**:

```bash
> better-sqlite3@12.4.6 build-release
> node-gyp configure --release && node-gyp build --release

gyp info it worked if it ends with ok
gyp info spawn make
gyp info spawn args [ 'BUILDTYPE=Release', '-C', 'build' ]
  COPY Release/better_sqlite3.node
gyp info ok
```

### 4. Verify the Binary Exists

You can verify the compiled binary in the Docker image:

```bash
# Build the production-deps stage
docker build --target production-deps -t test-deps .

# Check if the binary exists
docker run --rm test-deps find /workdir/node_modules -name "better_sqlite3.node"

# Expected output:
# /workdir/node_modules/.pnpm/better-sqlite3@12.4.6/node_modules/better-sqlite3/build/Release/better_sqlite3.node
```

## Key Principles

### 1. Avoid `--ignore-scripts` Side Effects

When you use `--ignore-scripts`:

- ✅ Prevents Husky from running
- ❌ Also prevents native modules from building
- ❌ Doesn't download source code (rebuild won't work)

**Solution**: Manually trigger the build for packages that need it.

### 2. Never Hardcode Version Numbers

**Bad**:

```dockerfile
COPY better-sqlite3@12.4.6/build/Release/better_sqlite3.node
```

**Good**:

```dockerfile
RUN SQLITE_DIR=$(find ... -name "better-sqlite3" ...)
```

### 3. Build in the Right Stage

Build native modules in the same stage where they'll be used:

- `production-deps` stage: Build bindings here
- `build` stage: Copy pre-built bindings from production-deps
- Final stage: Copy pre-built bindings from production-deps

### 4. Test Locally First

Before pushing to CI/CD, test Docker builds locally:

```bash
# Build and verify locally
docker build --no-cache --target production-deps --progress=plain -t test-build .

# Check the binary exists
docker run --rm test-build ls -la /workdir/node_modules/.pnpm/*/node_modules/better-sqlite3/build/Release/
```

## Other Native Modules

This approach works for any native Node.js module:

| Module             | Build Command                         | Notes                               |
| ------------------ | ------------------------------------- | ----------------------------------- |
| `better-sqlite3`   | `npm run build-release`               | Requires build-essential            |
| `bcrypt`           | `npm rebuild bcrypt`                  | Requires python3                    |
| `sharp`            | `npm rebuild sharp`                   | May need additional image libraries |
| `node-gyp` modules | `npm run build` or `node-gyp rebuild` | Check package.json scripts          |

**General pattern**:

1. Install with `--ignore-scripts`
2. Find package location with `find`
3. Run the package's specific build command
4. Verify binary exists

## Troubleshooting

### Binary still not found

**Check 1**: Verify build-essential is installed

```bash
docker run --rm <image> which gcc g++ make
```

**Check 2**: Check the build output for errors

```bash
docker build --progress=plain . 2>&1 | grep -A 10 "better-sqlite3"
```

**Check 3**: Verify the binary exists

```bash
docker run --rm <image> find /workdir -name "*.node"
```

### Husky errors persist

**Check**: Ensure `HUSKY=0` is set and `--ignore-scripts` is used:

```dockerfile
ENV HUSKY=0
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
```

### Build takes too long

**Optimization**: Use Docker layer caching by separating dependency installation from building:

```dockerfile
# This layer changes rarely (only when dependencies update)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# This layer only rebuilds when better-sqlite3 version changes
RUN SQLITE_DIR=$(find ...) && cd "$SQLITE_DIR" && npm run build-release
```

## Automated Testing

To prevent regressions when modifying Docker configuration, we've created an automated test suite.

### Running the tests

```bash
pnpm test:docker
```

### What gets tested

The test suite (`scripts/test-docker-build.sh`) validates:

1. **Production-deps stage builds successfully**
   - Verifies multi-stage build process works
   - Ensures no breaking changes in dependency installation

2. **better-sqlite3 binary compilation**
   - Confirms native module compiles correctly
   - Validates binary exists at expected path
   - Checks binary is executable with correct permissions
   - Verifies binary size is valid (>1MB for native module)

3. **Prisma client generation**
   - Ensures Prisma client is generated during build
   - Validates ORM is ready for production

4. **Error handling**
   - Tests that missing dependencies fail with clear error messages
   - Validates fail-fast behavior with context

5. **Build stage completion**
   - Confirms application builds successfully
   - Validates all build artifacts are created

6. **Production image assembly**
   - Verifies final production image builds
   - Checks all required files are present:
     - `/workdir/build/server/index.js`
     - `/workdir/package.json`
     - `/workdir/start.sh`
     - `/workdir/prisma/`

### When to run these tests

- **Before pushing Dockerfile changes** - Catch issues locally before CI/CD
- **After updating base images** - Ensure compatibility with new Node/OS versions
- **When changing native dependency versions** - Verify compilation still works
- **During code review** - Validate Docker changes don't break deployment

### Test output

Color-coded results with clear pass/fail indicators:

```text
==========================================
Docker Build Validation Tests
==========================================

Test 1: Building production-deps stage...
✓ Production-deps stage built successfully

Test 2: Verifying better-sqlite3 binary exists...
✓ Binary found at: /workdir/node_modules/.pnpm/better-sqlite3@12.4.6/...

Test 3: Verifying binary properties...
✓ Binary is executable: -rwxr-xr-x
✓ Binary size is valid: 1.9M (1969848 bytes)

...

==========================================
All tests passed! ✓
==========================================
```

### Test duration

Approximately 2-3 minutes (builds 3 Docker stages locally).

### CI/CD integration

While currently designed for local validation, the test can be added to CI/CD pipelines:

```yaml
# .github/workflows/docker-test.yml
- name: Test Docker Build
  run: pnpm test:docker
```

**Note**: Running in CI will increase build time, so consider running only on:

- Pull requests that modify `Dockerfile`
- Scheduled weekly builds
- Release branches

## References

- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [better-sqlite3 documentation](https://github.com/WiseLibs/better-sqlite3)
- [node-gyp documentation](https://github.com/nodejs/node-gyp)
- [pnpm --ignore-scripts flag](https://pnpm.io/cli/install#--ignore-scripts)
- [Test script source](../../scripts/test-docker-build.sh)

## Tags

#deployment #docker #native-modules #troubleshooting #ci-cd #testing #build-tools #sqlite #automation

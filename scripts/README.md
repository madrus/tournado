# Scripts

This directory contains utility scripts for the Tournado project.

## Docker Build Tests

### `test-docker-build.sh`

Automated test suite for validating Docker builds and native dependencies.

**Purpose**: Ensures that Docker configuration changes don't break:

- Native module compilation (better-sqlite3)
- Multi-stage build process
- Production image assembly
- Error handling

**Usage**:

```bash
pnpm test:docker
# or
./scripts/test-docker-build.sh
```

**What it tests**:

1. **Production Dependencies Stage** (`production-deps`)
   - Builds successfully
   - better-sqlite3 native binary is compiled
   - Binary is executable and correct size (>1MB)
   - Prisma client is generated

2. **Error Handling**
   - Clear error messages when dependencies are missing
   - Build fails fast with context

3. **Build Stage**
   - Application builds successfully
   - All build artifacts are created

4. **Final Production Image**
   - Image builds successfully
   - Contains all required files:
     - `/workdir/build/server/index.js`
     - `/workdir/package.json`
     - `/workdir/start.sh`
     - `/workdir/prisma`

**When to run**:

- Before pushing Dockerfile changes
- After updating Docker base images
- When changing native dependency versions
- As part of CI/CD validation (optional)

**Test duration**: ~2-3 minutes (builds 3 Docker stages)

**Requirements**:

- Docker installed and running
- Bash shell

**Exit codes**:

- `0` - All tests passed
- `1` - One or more tests failed

**Output**: Color-coded test results with clear pass/fail indicators.

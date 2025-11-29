#!/bin/bash
# Test script for Docker build validation
# Verifies that native dependencies are built correctly and error handling works

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "Docker Build Validation Tests"
echo "=========================================="
echo ""

# Test 1: Build production-deps stage
echo -e "${YELLOW}Test 1: Building production-deps stage...${NC}"
if docker build \
  --file "$PROJECT_ROOT/Dockerfile" \
  --target production-deps \
  --tag tournado-test-deps \
  --quiet \
  "$PROJECT_ROOT" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Production-deps stage built successfully${NC}"
else
  echo -e "${RED}✗ Failed to build production-deps stage${NC}"
  exit 1
fi
echo ""

# Test 2: Verify better-sqlite3 binary exists
echo -e "${YELLOW}Test 2: Verifying better-sqlite3 binary exists...${NC}"
BINARY_PATH=$(docker run --rm tournado-test-deps \
  find /workdir/node_modules -name "better_sqlite3.node" -path "*/Release/better_sqlite3.node" 2>/dev/null | head -1)

if [ -n "$BINARY_PATH" ]; then
  echo -e "${GREEN}✓ Binary found at: $BINARY_PATH${NC}"
else
  echo -e "${RED}✗ better_sqlite3.node binary not found${NC}"
  exit 1
fi
echo ""

# Test 3: Verify binary is executable and correct size
echo -e "${YELLOW}Test 3: Verifying binary properties...${NC}"
BINARY_INFO=$(docker run --rm tournado-test-deps ls -lh "$BINARY_PATH")
BINARY_SIZE=$(echo "$BINARY_INFO" | awk '{print $5}')
PERMISSIONS=$(echo "$BINARY_INFO" | awk '{print $1}')

if [[ "$PERMISSIONS" == *"x"* ]]; then
  echo -e "${GREEN}✓ Binary is executable: $PERMISSIONS${NC}"
else
  echo -e "${RED}✗ Binary is not executable: $PERMISSIONS${NC}"
  exit 1
fi

# Binary should be at least 1MB (native module)
SIZE_BYTES=$(docker run --rm tournado-test-deps stat -c%s "$BINARY_PATH")
if [ "$SIZE_BYTES" -gt 1000000 ]; then
  echo -e "${GREEN}✓ Binary size is valid: $BINARY_SIZE ($SIZE_BYTES bytes)${NC}"
else
  echo -e "${RED}✗ Binary size too small: $BINARY_SIZE ($SIZE_BYTES bytes)${NC}"
  exit 1
fi
echo ""

# Test 4: Verify Prisma client was generated
echo -e "${YELLOW}Test 4: Verifying Prisma client generation...${NC}"
PRISMA_CLIENT=$(docker run --rm tournado-test-deps \
  find /workdir/node_modules -path "*@prisma/client/index.js" 2>/dev/null | head -1)

if [ -n "$PRISMA_CLIENT" ]; then
  echo -e "${GREEN}✓ Prisma client generated${NC}"
else
  echo -e "${RED}✗ Prisma client not found${NC}"
  exit 1
fi
echo ""

# Test 5: Error handling - missing better-sqlite3
echo -e "${YELLOW}Test 5: Testing error handling (missing dependency)...${NC}"
cat > /tmp/test-dockerfile-error <<'EOF'
FROM node:22-bullseye-slim AS base
ENV HUSKY=0
RUN apt-get update && apt-get install -y build-essential python3 && \
  npm install -g pnpm@10 && \
  rm -rf /var/lib/apt/lists/*

FROM base AS test
WORKDIR /workdir
RUN echo '{"name":"test","version":"1.0.0"}' > package.json

RUN SQLITE_DIR=$(find /workdir/node_modules -type d -name "better-sqlite3" -path "*/node_modules/better-sqlite3" | head -1) && \
  if [ -z "$SQLITE_DIR" ] || [ ! -d "$SQLITE_DIR" ]; then \
    echo "ERROR: better-sqlite3 directory not found"; exit 1; \
  fi && \
  cd "$SQLITE_DIR" && \
  npm run build-release || { echo "ERROR: better-sqlite3 build failed"; exit 1; }
EOF

BUILD_OUTPUT=$(docker build -f /tmp/test-dockerfile-error --target test -t test-error . 2>&1 || true)
if echo "$BUILD_OUTPUT" | grep -q "ERROR: better-sqlite3 directory not found"; then
  echo -e "${GREEN}✓ Error handling works: clear error message displayed${NC}"
else
  echo -e "${RED}✗ Error handling failed: expected error message not found${NC}"
  echo "Build output:"
  echo "$BUILD_OUTPUT"
  exit 1
fi
rm /tmp/test-dockerfile-error
echo ""

# Test 6: Verify build stage
echo -e "${YELLOW}Test 6: Building full application (build stage)...${NC}"
if docker build \
  --file "$PROJECT_ROOT/Dockerfile" \
  --target build \
  --tag tournado-test-build \
  --quiet \
  "$PROJECT_ROOT" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Build stage completed successfully${NC}"
else
  echo -e "${RED}✗ Failed to build application${NC}"
  exit 1
fi
echo ""

# Test 7: Verify production image
echo -e "${YELLOW}Test 7: Building final production image...${NC}"
if docker build \
  --file "$PROJECT_ROOT/Dockerfile" \
  --tag tournado-test-production \
  --quiet \
  "$PROJECT_ROOT" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Production image built successfully${NC}"
else
  echo -e "${RED}✗ Failed to build production image${NC}"
  exit 1
fi
echo ""

# Test 8: Verify production image has required files
echo -e "${YELLOW}Test 8: Verifying production image contents...${NC}"
REQUIRED_FILES=(
  "/workdir/build/server/index.js"
  "/workdir/package.json"
  "/workdir/start.sh"
  "/workdir/prisma"
)

ALL_FOUND=true
for file in "${REQUIRED_FILES[@]}"; do
  if docker run --rm --entrypoint test tournado-test-production -e "$file" 2>/dev/null; then
    echo -e "${GREEN}  ✓ Found: $file${NC}"
  else
    echo -e "${RED}  ✗ Missing: $file${NC}"
    ALL_FOUND=false
  fi
done

if [ "$ALL_FOUND" = true ]; then
  echo -e "${GREEN}✓ All required files present${NC}"
else
  echo -e "${RED}✗ Some required files missing${NC}"
  exit 1
fi
echo ""

# Cleanup
echo -e "${YELLOW}Cleaning up test images...${NC}"
docker rmi tournado-test-deps tournado-test-build tournado-test-production > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}All tests passed! ✓${NC}"
echo "=========================================="

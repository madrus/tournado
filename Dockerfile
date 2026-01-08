# base node image (runtime dependencies only)
FROM node:22-bullseye-slim AS base

# set for base and all layer that inherit from it
ENV NODE_ENV=production
ENV HUSKY=0

# Install runtime dependencies and pnpm
RUN apt-get update && apt-get install -y \
  openssl \
  sqlite3 \
  python3-pip \
  && npm install -g pnpm@* \
  && pip3 install litecli \
  && rm -rf /var/lib/apt/lists/*

# build-deps stage: base + build tools (for compiling native modules)
FROM base AS build-deps

# Install build tools needed for native module compilation
RUN apt-get update && apt-get install -y \
  python3 \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

# Install all node_modules, including dev dependencies
FROM base AS deps

WORKDIR /workdir

ADD package.json pnpm-lock.yaml ./
# Allow Prisma and other packages to run their build scripts
RUN pnpm config set enable-pre-post-scripts true && \
  pnpm install --frozen-lockfile --unsafe-perm

# Setup production node_modules (needs build tools for native modules)
FROM build-deps AS production-deps

WORKDIR /workdir

# Set DATABASE_URL for Prisma generate
ENV DATABASE_URL=file:/data/sqlite.db

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# Install production dependencies without scripts (skip postinstall hook that calls husky)
# Note: prisma CLI is a devDependency but needed for 'prisma generate'
RUN pnpm install --prod --frozen-lockfile --ignore-scripts && \
  pnpm install prisma --ignore-scripts && \
  pnpm prisma generate

# Build better-sqlite3 native bindings manually
# The --ignore-scripts flag (above) prevents native module compilation, so we manually
# trigger the build. better-sqlite3 provides 'build-release' script that runs:
# node-gyp rebuild --release (optimized production build without debug symbols)
# See: https://github.com/WiseLibs/better-sqlite3/blob/master/package.json#scripts
RUN SQLITE_DIR=$(find /workdir/node_modules -type d -name "better-sqlite3" -path "*/node_modules/better-sqlite3" | head -1) && \
  if [ -z "$SQLITE_DIR" ] || [ ! -d "$SQLITE_DIR" ]; then \
    echo "ERROR: better-sqlite3 directory not found"; exit 1; \
  fi && \
  cd "$SQLITE_DIR" && \
  npm run build-release || { echo "ERROR: better-sqlite3 build failed"; exit 1; }

# Build the app
FROM base AS build

WORKDIR /workdir

# Set DATABASE_URL for Prisma generate during build
ENV DATABASE_URL=file:/data/sqlite.db
ARG VITE_ADMIN_SLUG
ENV VITE_ADMIN_SLUG=$VITE_ADMIN_SLUG

# Copy all files needed for the build
COPY --from=deps /workdir/node_modules /workdir/node_modules
COPY . .

# Build the application
RUN pnpm run build

# Finally, build the production image with minimal footprint
FROM base

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT="8080"

# Create data directory and set permissions
RUN mkdir -p /data && chmod 777 /data

# add shortcut for connecting to database CLI
RUN echo '#!/bin/sh\nset -x\nlitecli "$(echo $DATABASE_URL | sed "s/file://")"' > /usr/local/bin/db-cli && chmod +x /usr/local/bin/db-cli

WORKDIR /workdir

# Copy only the necessary files
COPY --from=production-deps /workdir/node_modules /workdir/node_modules
COPY --from=build /workdir/build /workdir/build
COPY --from=build /workdir/public /workdir/public
COPY --from=build /workdir/package.json /workdir/package.json
COPY --from=build /workdir/start.sh /workdir/start.sh
COPY --from=build /workdir/prisma /workdir/prisma
COPY --from=build /workdir/prisma.config.ts /workdir/prisma.config.ts

ENTRYPOINT [ "./start.sh" ]

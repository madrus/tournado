# base node image
FROM node:22-bullseye-slim AS base

# set for base and all layer that inherit from it
ENV NODE_ENV=production
ENV HUSKY=0

# Install openssl for Prisma, build tools for native modules, and pnpm
RUN apt-get update && apt-get install -y \
  openssl \
  sqlite3 \
  python3 \
  python3-pip \
  build-essential \
  && npm install -g pnpm@10 \
  && pip3 install litecli \
  && rm -rf /var/lib/apt/lists/*

# Install all node_modules, including dev dependencies
FROM base AS deps

WORKDIR /workdir

ADD package.json pnpm-lock.yaml ./
RUN if [ -f .npmrc ]; then ADD .npmrc ./; fi
# Allow Prisma and other packages to run their build scripts
RUN pnpm config set enable-pre-post-scripts true && \
  pnpm install --frozen-lockfile --unsafe-perm

# Setup production node_modules
FROM base AS production-deps

WORKDIR /workdir

# Set DATABASE_URL for Prisma generate
ENV DATABASE_URL=file:/data/sqlite.db

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN if [ -f .npmrc ]; then COPY .npmrc ./; fi

# Install production dependencies without scripts (skip postinstall hook that calls husky)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts && \
  pnpm install prisma --ignore-scripts && \
  pnpm prisma generate

# Build better-sqlite3 native bindings manually
# Find the better-sqlite3 directory and run its build script directly
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

ENTRYPOINT [ "./start.sh" ]

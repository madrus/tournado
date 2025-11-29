# base node image
FROM node:22-bullseye-slim AS base

# set for base and all layer that inherit from it
ENV NODE_ENV=production
ENV HUSKY=0

# Install openssl for Prisma and pnpm
RUN apt-get update && apt-get install -y openssl sqlite3 python3-pip && \
  npm install -g pnpm@10 && \
  pip3 install litecli

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

# Install production dependencies
# We need to run scripts for better-sqlite3 to build native bindings
# This is safe because:
# 1. We're installing from a locked lockfile (frozen-lockfile)
# 2. Only production dependencies are installed
# 3. better-sqlite3 is a well-known, vetted package
RUN pnpm install --prod --frozen-lockfile && \
  pnpm install prisma @prisma/client && \
  pnpm prisma generate

# Copy better-sqlite3 native bindings from deps stage (already built with --unsafe-perm)
# Using shell glob to avoid hardcoding version number
RUN mkdir -p /tmp/better-sqlite3-build
COPY --from=deps /workdir/node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3/build /tmp/better-sqlite3-build/
RUN cp -r /tmp/better-sqlite3-build/* /workdir/node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3/ && \
  rm -rf /tmp/better-sqlite3-build

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

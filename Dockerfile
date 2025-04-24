# base node image
FROM node:22-bullseye-slim AS base

# set for base and all layer that inherit from it
ENV NODE_ENV=production
ENV HUSKY=0

# Install openssl for Prisma and pnpm
RUN apt-get update && apt-get install -y openssl sqlite3 && \
  npm install -g pnpm@10

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

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN if [ -f .npmrc ]; then COPY .npmrc ./; fi

# Install production dependencies and Prisma
RUN pnpm install --prod --frozen-lockfile --ignore-scripts && \
  pnpm install prisma @prisma/client --ignore-scripts && \
  pnpm prisma generate

# Build the app
FROM base AS build

WORKDIR /workdir

# Copy all files needed for the build
COPY --from=deps /workdir/node_modules /workdir/node_modules
COPY . .

# Build the application
RUN pnpm run build

# Finally, build the production image with minimal footprint
FROM base

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT="8080"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /workdir

# Copy only the necessary files
COPY --from=production-deps /workdir/node_modules /workdir/node_modules
COPY --from=build /workdir/build /workdir/build
COPY --from=build /workdir/public /workdir/public
COPY --from=build /workdir/package.json /workdir/package.json
COPY --from=build /workdir/start.sh /workdir/start.sh
COPY --from=build /workdir/prisma /workdir/prisma

ENTRYPOINT [ "./start.sh" ]

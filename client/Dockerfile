####### Base image #######
FROM node:18-alpine AS base

# Add Maintainer Info
LABEL maintainer="Austin Spencer <gshare@austinbspencer.com>"

####### Install dependencies only when needed #######
FROM base AS deps
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# Adding timeout to resolve: https://github.com/yarnpkg/yarn/issues/4890
RUN pnpm install --frozen-lockfile --shamefully-hoist

####### Production Image #######
FROM base AS runner

WORKDIR /app

COPY --link --chmod=755 entrypoint.sh /scripts/entrypoint.sh
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Install bash to execute entrypoint
RUN apk add --no-cache bash

ENV PORT 3000
EXPOSE 3000

# Disabled Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Run the entrypoint scrip to start application
CMD ["/bin/bash", "/scripts/entrypoint.sh"]
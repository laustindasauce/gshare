####### Base image #######
FROM node:18-alpine AS base

# Add Maintainer Info
LABEL maintainer="Austin Spencer <gshare@austinbspencer.com>"

####### Install dependencies only when needed #######
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
# Adding timeout to resolve: https://github.com/yarnpkg/yarn/issues/4890
RUN yarn install --frozen-lockfile --network-timeout 100000

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
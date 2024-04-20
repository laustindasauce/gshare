####### Base image #######
FROM node:18-alpine AS base

# Add Maintainer Info
LABEL maintainer="Austin Spencer <abspencer2097@gmail.com>"

####### Install dependencies only when needed #######
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY client/package.json client/yarn.lock ./
RUN yarn install --frozen-lockfile

####### Production Image #######
FROM base AS runner

WORKDIR /app

COPY /client .
COPY version version
COPY --from=deps /app/node_modules ./node_modules
COPY --link --chmod=755 client-entrypoint.sh /scripts/client-entrypoint.sh

# Install bash to execute entrypoint
RUN apk add --no-cache bash

ENV PORT 3000
EXPOSE 3000

# Disabled Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Run the entrypoint scrip to start application
CMD ["/bin/bash", "/scripts/client-entrypoint.sh"]
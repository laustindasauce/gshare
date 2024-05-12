####### Base image #######
FROM node:18-alpine AS base

# Add Maintainer Info
LABEL maintainer="Austin Spencer <gshare@austinbspencer.com>"

####### Install dependencies only when needed #######
FROM base AS deps
# Install pnpm globally
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --shamefully-hoist

####### Production Image #######
FROM base AS runner

# Install pnpm globally
RUN npm install -g pnpm
# Install bash to execute entrypoint
RUN apk add --no-cache bash
WORKDIR /app
# Copy files
COPY --link --chmod=755 entrypoint.sh ./entrypoint.sh
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ARG APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=${APP_VERSION}
ENV PORT 3000
# Disabled Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

# Run the entrypoint scrip to start application
CMD ["/bin/bash", "/app/entrypoint.sh"]
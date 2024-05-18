#!/bin/bash
# client-entrypoint.sh
echo "APP Version: $NEXT_PUBLIC_APP_VERSION"

# Combine SERVER_PROTOCOL and SERVER_HOST into a full URL
export SERVER_URL="$SERVER_PROTOCOL://$SERVER_HOST"
export NEXT_PUBLIC_API_URL="$SERVER_URL"

echo "API URL: $NEXT_PUBLIC_API_URL"

# All required environment variables available on frontend
REQUIRED_VARIABLES=(
    "SERVER_PROTOCOL"
    "SERVER_HOST"
    "NEXT_PUBLIC_API_URL"
    "NEXT_PUBLIC_CLIENT_URL"
    "NEXT_PUBLIC_PHOTOGRAPHER_NAME"
    "NEXT_PUBLIC_PHOTOGRAPHER_EMAIL"
    "NEXT_PUBLIC_PHOTOGRAPHER_WEBSITE"
)

# Check if each required variable is set
for VAR in "${REQUIRED_VARIABLES[@]}"; do
    echo "Checking $VAR is set."
    if [ -z "${!VAR}" ]; then
        echo "$VAR is not set. Please set it and rerun the script."
        exit 1
    fi
done

pnpm build

pnpm start
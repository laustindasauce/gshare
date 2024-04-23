#!/bin/bash
# client-entrypoint.sh

# All required environment variables available on frontend
REQUIRED_VARIABLES=(
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

yarn build

yarn start
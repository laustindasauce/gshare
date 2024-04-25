#!/bin/bash

echo "Installing client dependencies..."
cd client
# Set version
touch version
echo "vx.x.x" > version
pnpm install
wait $!

echo "Starting Next.js development server..."
pnpm dev &

echo "Starting Golang API with 'air'..."
cd ../server
# Set version
touch version
echo "vx.x.x" > version
air &

# Wait for both processes to finish (e.g., when you stop the script)
wait

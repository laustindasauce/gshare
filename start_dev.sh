#!/bin/bash

echo "Installing client dependencies..."
cd client
pnpm install
wait $!

echo "Starting Next.js development server..."
pnpm dev &

echo "Starting Golang API with 'air'..."
cd ../server
air &

# Wait for both processes to finish (e.g., when you stop the script)
wait

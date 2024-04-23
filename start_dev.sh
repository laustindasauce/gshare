#!/bin/bash

echo "Installing client dependencies..."
cd client
# Set version
touch version
echo "vx.x.x" > version
yarn install
wait $!

echo "Starting Next.js development server..."
yarn dev &

echo "Starting Golang API with 'air'..."
cd ../server
# Set version
touch version
echo "vx.x.x" > version
air &

# Wait for both processes to finish (e.g., when you stop the script)
wait

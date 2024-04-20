#!/bin/bash

# Set version
echo "Copying version file to the client and server directories..."
cp version client/
cp version server/

echo "Installing client dependencies..."
cd client
yarn install
wait $!

echo "Starting Next.js development server..."
yarn dev &

echo "Starting Golang API with 'air'..."
cd ../server
air &

# Wait for both processes to finish (e.g., when you stop the script)
wait

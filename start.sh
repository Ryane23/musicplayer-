#!/bin/bash

# Music Player Startup Script

echo "Setting up Music Player App..."
echo "Checking for node_modules..."

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Failed to install dependencies. Please check your Node.js and npm installation."
        exit 1
    fi
else
    echo "Dependencies already installed."
fi

echo "Starting the Music Player App..."
npx expo start
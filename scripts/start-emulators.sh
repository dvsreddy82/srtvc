#!/bin/bash

# Script to start Firebase Emulators for local development

set -e

echo "🔥 Starting Firebase Emulators..."
echo "=================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase >/dev/null 2>&1; then
  echo "❌ Firebase CLI not found. Install it with: npm install -g firebase-tools"
  exit 1
fi

# Navigate to cloud-functions directory
cd "$(dirname "$0")/../cloud-functions"

# Check if firebase.json exists
if [ ! -f firebase.json ]; then
  echo "❌ firebase.json not found in cloud-functions directory"
  exit 1
fi

# Start emulators
echo "🚀 Starting emulators..."
echo ""
echo "Emulator UI will be available at: http://localhost:4000"
echo "Firestore emulator: localhost:8081"
echo "Auth emulator: localhost:9099"
echo "Storage emulator: localhost:9199"
echo "Functions emulator: localhost:5001"
echo ""
echo "Press Ctrl+C to stop the emulators"
echo ""

firebase emulators:start


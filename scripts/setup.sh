#!/bin/bash

# Pet Management Cloud - Setup Script
# This script helps set up the development environment

set -e

echo "🐾 Pet Management Cloud - Setup Script"
echo "========================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

if ! command -v firebase &> /dev/null; then
    echo "⚠️  Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo ""

# Build shared package
echo "🔨 Building shared package..."
cd packages/shared
pnpm build
cd ../..
echo ""

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Firebase configuration"
else
    echo "✅ .env file already exists"
fi
echo ""

# Check Firebase login
echo "🔥 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Not logged in to Firebase. Please run: firebase login"
else
    echo "✅ Firebase authentication verified"
fi
echo ""

# Summary
echo "========================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Firebase configuration"
echo "2. Run: cd cloud-functions && firebase use --add"
echo "3. Configure Cloud Functions: firebase functions:config:set backup.bucket_name=\"your-bucket\""
echo "4. Deploy Firebase services: cd cloud-functions && firebase deploy"
echo "5. Start development: cd packages/web && pnpm dev"
echo ""
echo "For detailed instructions, see CONFIGURATION.md"


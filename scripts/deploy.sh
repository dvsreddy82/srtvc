#!/bin/bash

# Pet Management Cloud - Deployment Script
# This script helps deploy the application to Firebase

set -e

echo "🚀 Pet Management Cloud - Deployment Script"
echo "==========================================="
echo ""

# Check if in correct directory
if [ ! -f "cloud-functions/firebase.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Build shared package
echo "🔨 Building shared package..."
cd packages/shared
pnpm build
cd ../..

# Build web package
echo "🔨 Building web package..."
cd packages/web
pnpm build
cd ../..

# Deploy to Firebase
echo "🔥 Deploying to Firebase..."
cd cloud-functions

echo ""
echo "Select deployment options:"
echo "1. Deploy everything"
echo "2. Deploy functions only"
echo "3. Deploy hosting only"
echo "4. Deploy Firestore rules only"
echo "5. Deploy storage rules only"
echo "6. Deploy indexes only"
read -p "Enter choice (1-6): " choice

case $choice in
    1)
        echo "Deploying everything..."
        firebase deploy
        ;;
    2)
        echo "Deploying functions..."
        firebase deploy --only functions
        ;;
    3)
        echo "Deploying hosting..."
        firebase deploy --only hosting
        ;;
    4)
        echo "Deploying Firestore rules..."
        firebase deploy --only firestore:rules
        ;;
    5)
        echo "Deploying storage rules..."
        firebase deploy --only storage
        ;;
    6)
        echo "Deploying indexes..."
        firebase deploy --only firestore:indexes
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"


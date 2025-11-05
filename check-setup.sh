#!/bin/bash

echo "🔍 Pet Management Cloud - Setup Status Check"
echo "=========================================="
echo ""

# Check .env file
if [ -f .env ]; then
  echo "✅ .env file exists"
  if grep -q "your-api-key-here" .env; then
    echo "   ⚠️  .env file still has placeholder values - needs to be updated"
  else
    echo "   ✅ .env file appears to be configured"
  fi
else
  echo "❌ .env file missing"
fi

# Check Firebase CLI
if command -v firebase >/dev/null 2>&1; then
  echo "✅ Firebase CLI installed: $(firebase --version)"
else
  echo "❌ Firebase CLI not installed"
fi

# Check Firebase login
if firebase projects:list >/dev/null 2>&1; then
  echo "✅ Firebase logged in"
  firebase projects:list 2>/dev/null | head -5
else
  echo "❌ Firebase not logged in"
  echo "   Run: firebase login"
fi

# Check Firebase project
if [ -f .firebaserc ]; then
  PROJECT_ID=$(grep -o '"default": "[^"]*"' .firebaserc | cut -d'"' -f4)
  if [ "$PROJECT_ID" != "your-project-id" ] && [ -n "$PROJECT_ID" ]; then
    echo "✅ Firebase project configured: $PROJECT_ID"
  else
    echo "⚠️  Firebase project not configured in .firebaserc"
  fi
fi

# Check Firebase initialization
if [ -f cloud-functions/firebase.json ]; then
  echo "✅ Firebase project initialized"
else
  echo "❌ Firebase project not initialized"
  echo "   Run: cd cloud-functions && firebase init"
fi

# Check shared package
if [ -d packages/shared/dist ]; then
  echo "✅ Shared package built"
else
  echo "❌ Shared package not built"
  echo "   Run: cd packages/shared && pnpm build"
fi

# Check Firestore rules
if [ -f cloud-functions/firestore.rules ]; then
  echo "✅ Firestore rules file exists"
else
  echo "⚠️  Firestore rules file not found"
fi

# Check Storage rules
if [ -f cloud-functions/storage.rules ]; then
  echo "✅ Storage rules file exists"
else
  echo "⚠️  Storage rules file not found"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="

if ! firebase projects:list >/dev/null 2>&1; then
  echo "1. Login to Firebase: firebase login"
fi

if [ -f .env ] && grep -q "your-api-key-here" .env; then
  echo "2. Update .env file with your Firebase configuration"
  echo "   Get config from: Firebase Console → Project Settings → Your apps"
fi

if [ ! -f cloud-functions/firebase.json ]; then
  echo "3. Initialize Firebase: cd cloud-functions && firebase init"
fi

if [ -f cloud-functions/firebase.json ]; then
  echo "4. Deploy Firestore and Storage rules:"
  echo "   cd cloud-functions && firebase deploy --only firestore:rules,storage"
fi

echo "5. Test web app: cd packages/web && pnpm dev"


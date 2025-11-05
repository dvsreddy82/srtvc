#!/bin/bash

set -e

echo "🚀 Pet Management Cloud - Configuration Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
if ! command -v firebase >/dev/null 2>&1; then
  echo -e "${RED}❌ Firebase CLI not installed${NC}"
  echo "   Installing Firebase CLI..."
  npm install -g firebase-tools
fi
echo -e "${GREEN}✅ Firebase CLI installed${NC}"

if ! command -v pnpm >/dev/null 2>&1; then
  echo -e "${RED}❌ pnpm not installed${NC}"
  echo "   Installing pnpm..."
  npm install -g pnpm
fi
echo -e "${GREEN}✅ pnpm installed${NC}"

# Step 2: Check Firebase login
echo ""
echo "📋 Step 2: Checking Firebase login..."
if firebase projects:list >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Firebase logged in${NC}"
  echo "   Available projects:"
  firebase projects:list | head -10
else
  echo -e "${YELLOW}⚠️  Firebase not logged in${NC}"
  echo ""
  echo "   Please run this command in your terminal:"
  echo -e "   ${GREEN}firebase login${NC}"
  echo ""
  echo "   This will open a browser window for authentication."
  read -p "   Press Enter after you've logged in to Firebase..."
  
  if ! firebase projects:list >/dev/null 2>&1; then
    echo -e "${RED}❌ Still not logged in. Please try again.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Firebase logged in${NC}"
fi

# Step 3: Check/create .env file
echo ""
echo "📋 Step 3: Checking .env file..."
if [ ! -f .env ]; then
  echo "   Creating .env file template..."
  cat > .env << 'EOF'
# Firebase Configuration
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id-here

# Firebase Functions Region
FIREBASE_FUNCTIONS_REGION=us-central1

# Webhook Secret
WEBHOOK_SECRET=your-secret-key-here

# Backup Configuration
BACKUP_BUCKET_NAME=your-project-backups
EOF
  echo -e "${GREEN}✅ .env file created${NC}"
else
  echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check if .env needs to be updated
if grep -q "your-api-key-here" .env; then
  echo -e "${YELLOW}⚠️  .env file has placeholder values${NC}"
  echo ""
  echo "   Next steps:"
  echo "   1. Go to https://console.firebase.google.com/"
  echo "   2. Create a new project (or select existing)"
  echo "   3. Enable Authentication, Firestore, Storage, and Functions"
  echo "   4. Go to Project Settings → Your apps → Add Web app"
  echo "   5. Copy the Firebase config values"
  echo "   6. Update .env file with your values"
  echo ""
  read -p "   Press Enter when you've updated .env file..."
fi

# Load .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Step 4: Initialize Firebase project
echo ""
echo "📋 Step 4: Checking Firebase project initialization..."
if [ ! -f cloud-functions/firebase.json ]; then
  echo -e "${YELLOW}⚠️  Firebase project not initialized${NC}"
  echo ""
  echo "   Initializing Firebase project..."
  echo "   Please select the following options:"
  echo "   - Select: Firestore, Functions, Storage"
  echo "   - Use existing project"
  echo "   - Select your Firebase project"
  echo "   - TypeScript for Functions"
  echo "   - Yes to ESLint"
  echo "   - Yes to install dependencies"
  echo ""
  read -p "   Press Enter to start Firebase init..."
  
  cd cloud-functions
  firebase init
  cd ..
  
  if [ ! -f cloud-functions/firebase.json ]; then
    echo -e "${RED}❌ Firebase initialization failed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Firebase project initialized${NC}"
else
  echo -e "${GREEN}✅ Firebase project initialized${NC}"
fi

# Step 5: Update .firebaserc if needed
if [ -f .firebaserc ]; then
  PROJECT_ID=$(grep -o '"default": "[^"]*"' .firebaserc | cut -d'"' -f4)
  if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo ""
    echo "📋 Updating .firebaserc with actual project ID..."
    if [ -n "$FIREBASE_PROJECT_ID" ] && [ "$FIREBASE_PROJECT_ID" != "your-project-id" ]; then
      sed -i '' "s/your-project-id/$FIREBASE_PROJECT_ID/g" .firebaserc
      echo -e "${GREEN}✅ .firebaserc updated${NC}"
    fi
  fi
fi

# Step 6: Build shared package
echo ""
echo "📋 Step 6: Building shared package..."
cd packages/shared
pnpm build
cd ../..
echo -e "${GREEN}✅ Shared package built${NC}"

# Step 7: Deploy Firestore and Storage rules
echo ""
echo "📋 Step 7: Deploying Firestore and Storage rules..."
cd cloud-functions

if [ -f firestore.rules ] && [ -f storage.rules ]; then
  echo "   Deploying rules..."
  firebase deploy --only firestore:rules,storage
  echo -e "${GREEN}✅ Rules deployed${NC}"
else
  echo -e "${YELLOW}⚠️  Rules files not found. Skipping deployment.${NC}"
fi

cd ..

# Summary
echo ""
echo "=============================================="
echo -e "${GREEN}✅ Configuration Complete!${NC}"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Test web app: cd packages/web && pnpm dev"
echo "2. Deploy Cloud Functions: cd cloud-functions && firebase deploy --only functions"
echo "3. Configure mobile apps (see SETUP_GUIDE.md)"
echo ""
echo "Run './check-setup.sh' anytime to check setup status."


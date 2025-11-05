# Pet Management Cloud - Step-by-Step Setup Guide

This guide will walk you through setting up the entire Pet Management Cloud application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 (Install: `npm install -g pnpm`)
- **Git** ([Download](https://git-scm.com/))
- **Firebase CLI** (Install: `npm install -g firebase-tools`)
- **For Mobile**: Xcode (macOS) and Android Studio
- **For Desktop**: No additional requirements (Electron)

---

## Step 1: Clone and Setup Repository

### 1.1 Clone the repository
```bash
git clone https://github.com/dvsreddy82/PET-MANAGEMENT.git
cd PET-MANAGEMENT
```

### 1.2 Install dependencies
```bash
pnpm install
```

This installs dependencies for all packages (shared, web, mobile, desktop).

---

## Step 2: Firebase Project Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `pet-management-cloud` (or your preferred name)
4. **Disable** Google Analytics (optional, for cost savings)
5. Click **"Create project"**
6. Wait for project creation to complete

### 2.2 Enable Firebase Services

In your Firebase project, enable the following services:

#### A. Authentication
1. Go to **Authentication** → **Get started**
2. Click **"Sign-in method"** tab
3. Enable **Email/Password** provider
4. Click **Save**

#### B. Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **"Start in test mode"** (we'll update rules later)
3. Select a location (choose closest to your users)
4. Click **"Enable"**

#### C. Storage
1. Go to **Storage** → **Get started**
2. Click **"Start in test mode"** (we'll update rules later)
3. Choose same location as Firestore
4. Click **"Done"**

#### D. Cloud Functions
1. Go to **Functions** → **Get started**
2. Accept terms and enable billing (required for Functions)
3. Wait for initialization

---

## Step 3: Configure Environment Variables

### 3.1 Get Firebase Configuration

1. Go to Firebase Console → **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click **Web icon** (</>) to add a web app
4. Register app with nickname: `Pet Management Web`
5. **Copy the Firebase configuration object**

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 3.2 Create Environment File

```bash
cp .env.example .env
```

### 3.3 Edit .env file

Open `.env` and fill in your Firebase configuration:

```bash
# Firebase Configuration
FIREBASE_API_KEY=AIza...your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Functions Region (optional, default: us-central1)
FIREBASE_FUNCTIONS_REGION=us-central1

# Webhook Secret (for veterinarian webhooks)
WEBHOOK_SECRET=your-secret-key-here

# Backup Configuration
BACKUP_BUCKET_NAME=your-project-backups
```

**Save the file.**

---

## Step 4: Configure Firebase CLI

### 4.1 Login to Firebase

```bash
firebase login
```

This opens a browser window. Sign in with your Google account.

### 4.2 Initialize Firebase Project

```bash
firebase init
```

**Select the following options:**

1. **Features to set up:**
   - ✅ Firestore
   - ✅ Functions
   - ✅ Storage
   - ✅ Hosting (optional, for web deployment)
   - ❌ Emulators (skip for now)

2. **Select existing project:** Choose your Firebase project

3. **Firestore Rules file:** `firestore.rules` (accept default)

4. **Firestore Indexes file:** `firestore.indexes.json` (accept default)

5. **Functions language:** TypeScript

6. **ESLint:** Yes

7. **Install dependencies:** Yes

8. **Storage Rules file:** `storage.rules` (accept default)

---

## Step 5: Update Firebase Configuration Files

### 5.1 Update Shared Firebase Config

Edit `packages/shared/src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
```

### 5.2 Update Web Firebase Config (if separate)

Edit `packages/web/src/config/firebase.ts` (if it exists) with same values.

---

## Step 6: Deploy Firestore Security Rules

### 6.1 Review Firestore Rules

The rules are in `firestore.rules`. Review them to ensure they match your requirements.

### 6.2 Deploy Rules

```bash
firebase deploy --only firestore:rules
```

---

## Step 7: Deploy Storage Rules

### 7.1 Review Storage Rules

The rules are in `storage.rules`. Review them.

### 7.2 Deploy Rules

```bash
firebase deploy --only storage
```

---

## Step 8: Create Firestore Indexes

### 8.1 Review Indexes

The indexes are defined in `firestore.indexes.json`. Review them.

### 8.2 Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

**Note:** Firestore will automatically create indexes, but it may take a few minutes.

---

## Step 9: Build Shared Package

```bash
cd packages/shared
pnpm build
cd ../..
```

---

## Step 10: Configure Cloud Functions

### 10.1 Navigate to Functions Directory

```bash
cd cloud-functions
```

### 10.2 Install Dependencies

```bash
pnpm install
```

### 10.3 Set Environment Variables

```bash
firebase functions:config:set backup.bucket_name="your-project-backups"
```

### 10.4 Build Functions

```bash
pnpm build
```

### 10.5 Deploy Functions

```bash
firebase deploy --only functions
```

**This may take 5-10 minutes for the first deployment.**

---

## Step 11: Test Web Application

### 11.1 Start Web Dev Server

```bash
cd packages/web
pnpm dev
```

### 11.2 Open Browser

Navigate to `http://localhost:3000` (or port shown in terminal)

### 11.3 Test Signup

1. Click **"Sign Up"**
2. Create a test account
3. Verify account is created in Firebase Console → Authentication

### 11.4 Test Features

- Add a pet
- Create a booking
- Test other features

---

## Step 12: Configure Mobile App (Optional)

### 12.1 iOS Setup

1. Open Firebase Console → Project Settings
2. Click **"Add app"** → **iOS**
3. Enter bundle ID (e.g., `com.petmanagement.app`)
4. Download `GoogleService-Info.plist`
5. Place it in `packages/mobile/ios/`

### 12.2 Android Setup

1. Open Firebase Console → Project Settings
2. Click **"Add app"** → **Android**
3. Enter package name (e.g., `com.petmanagement.app`)
4. Download `google-services.json`
5. Place it in `packages/mobile/android/app/`

### 12.3 Build Mobile App

```bash
cd packages/mobile

# iOS
pnpm run ios

# Android
pnpm run android
```

---

## Step 13: Configure Desktop App (Optional)

### 13.1 Build Desktop App

```bash
cd packages/desktop

# Development
pnpm run dev

# Production Build
pnpm run build:mac    # macOS
pnpm run build:win    # Windows
pnpm run build:linux  # Linux
```

---

## Step 14: Verify Setup

### 14.1 Check Firebase Console

1. **Authentication**: Should show test users
2. **Firestore**: Should have collections after first use
3. **Storage**: Should have folders after uploading images
4. **Functions**: Should show deployed functions

### 14.2 Test All Features

- ✅ User authentication
- ✅ Pet management
- ✅ Booking creation
- ✅ Image uploads
- ✅ Notifications (if configured)

---

## Troubleshooting

### Issue: Firebase not initialized

**Solution:**
- Check `.env` file has correct values
- Verify Firebase config in `packages/shared/src/config/firebase.ts`
- Rebuild shared package: `cd packages/shared && pnpm build`

### Issue: Firestore rules errors

**Solution:**
- Check rules syntax in `firestore.rules`
- Deploy rules: `firebase deploy --only firestore:rules`
- Wait a few minutes for rules to propagate

### Issue: Functions deployment fails

**Solution:**
- Ensure billing is enabled in Firebase Console
- Check Node.js version: `node --version` (should be 18+)
- Rebuild functions: `cd cloud-functions && pnpm build`

### Issue: Storage upload fails

**Solution:**
- Check storage rules: `firebase deploy --only storage`
- Verify storage bucket name in config
- Check file size limits

### Issue: Mobile app not connecting

**Solution:**
- Verify `GoogleService-Info.plist` (iOS) or `google-services.json` (Android) is in correct location
- Rebuild mobile app
- Check Firebase project settings

---

## Quick Setup Script

For faster setup, you can use the provided script:

```bash
./scripts/setup.sh
```

This will:
- Check prerequisites
- Install dependencies
- Build shared package
- Create .env file (you'll need to fill it)

---

## Next Steps

1. **Customize branding**: Update app name, colors, logos
2. **Configure email templates**: In Firebase Console → Authentication → Templates
3. **Set up domain**: For custom domain in Firebase Hosting
4. **Configure backups**: Set up automated Firestore backups
5. **Monitor costs**: Set up billing alerts in Firebase Console

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Firebase Console for errors
3. Check browser console for client-side errors
4. Review Cloud Functions logs: `firebase functions:log`

---

## Configuration Checklist

- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] Cloud Functions enabled
- [ ] `.env` file configured
- [ ] Firebase CLI logged in
- [ ] Firebase project initialized
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Firestore indexes deployed
- [ ] Cloud Functions deployed
- [ ] Shared package built
- [ ] Web app tested
- [ ] Mobile app configured (optional)
- [ ] Desktop app tested (optional)

---

**Congratulations!** Your Pet Management Cloud application is now configured and ready to use! 🎉


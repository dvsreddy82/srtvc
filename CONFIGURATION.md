# Configuration Guide

This document provides step-by-step instructions for configuring the Pet Management Cloud application.

## Prerequisites

- Node.js 18+ and npm/pnpm installed
- Firebase account and project
- Firebase CLI installed: `npm install -g firebase-tools`

## Step 1: Firebase Project Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Enter project name: `pet-management-cloud`
   - Enable Google Analytics (optional)
   - Create project

2. **Enable Firebase Services**
   - **Authentication**: Enable Email/Password provider
   - **Firestore Database**: Create database in production mode
   - **Storage**: Enable Storage
   - **Cloud Functions**: Enable (requires Blaze plan)
   - **Cloud Messaging**: Enable FCM

3. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click Web app icon (</>)
   - Register app name: `pet-management-web`
   - Copy configuration values

## Step 2: Environment Variables

1. **Copy Environment Template**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` file** with your Firebase configuration:
   ```env
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=your-app-id
   ```

## Step 3: Firebase Project Configuration

1. **Initialize Firebase in Project**
   ```bash
   cd cloud-functions
   firebase login
   firebase use --add
   # Select your project
   ```

2. **Update `.firebaserc`**
   ```json
   {
     "projects": {
       "default": "your-project-id"
     }
   }
   ```

## Step 4: Cloud Functions Configuration

1. **Set Cloud Functions Config**
   ```bash
   cd cloud-functions
   
   # Set backup bucket name
   firebase functions:config:set backup.bucket_name="pet-management-backups"
   
   # Set veterinarian webhook API key
   firebase functions:config:set veterinarian.api_key="your-secure-api-key"
   
   # Set webhook secret for HMAC verification
   firebase functions:config:set veterinarian.webhook_secret="your-webhook-secret"
   ```

2. **Build and Deploy Functions**
   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   firebase deploy --only functions
   ```

## Step 5: Firestore Security Rules

1. **Deploy Security Rules**
   ```bash
   cd cloud-functions
   firebase deploy --only firestore:rules
   ```

2. **Deploy Storage Rules**
   ```bash
   firebase deploy --only storage
   ```

## Step 6: Firestore Indexes

Create composite indexes for the following queries:

1. **Bookings by User and Date**
   - Collection: `bookings`
   - Fields: `userId` (Ascending), `startDate` (Ascending)

2. **Bookings by Kennel and Date**
   - Collection: `bookings`
   - Fields: `kennelId` (Ascending), `startDate` (Ascending)

3. **Medical Records by Pet and Date**
   - Collection: `medical_records`
   - Fields: `petId` (Ascending), `date` (Descending)

4. **Vaccines by Pet and Date**
   - Collection: `vaccines`
   - Fields: `petId` (Ascending), `administeredDate` (Descending)

5. **Reviews by Kennel**
   - Collection: `reviews`
   - Fields: `kennelId` (Ascending), `createdAt` (Descending)

**To create indexes:**
- Go to Firebase Console > Firestore > Indexes
- Click "Create Index"
- Or use `firestore.indexes.json` and run `firebase deploy --only firestore:indexes`

## Step 7: Cloud Scheduler Setup

1. **Create Backup Schedule**
   - Go to Google Cloud Console > Cloud Scheduler
   - Create new job:
     - Name: `weekly-backup`
     - Schedule: `0 2 * * 0` (Every Sunday at 2 AM)
     - Target: HTTP
     - URL: Your `automatedBackup` function URL
     - HTTP method: POST

2. **Create Vaccine Reminder Schedule**
   - Create new job:
     - Name: `vaccine-reminders`
     - Schedule: `0 9 * * *` (Daily at 9 AM UTC)
     - Target: HTTP
     - URL: Your `vaccineReminders` function URL
     - HTTP method: POST

## Step 8: Storage Bucket Setup

1. **Create Backup Bucket**
   ```bash
   gsutil mb -p your-project-id gs://pet-management-backups
   ```

2. **Set Bucket Permissions**
   ```bash
   gsutil iam ch serviceAccount:your-project@appspot.gserviceaccount.com:roles/storage.objectAdmin gs://pet-management-backups
   ```

## Step 9: Install Dependencies

1. **Root and Shared Package**
   ```bash
   pnpm install
   cd packages/shared
   pnpm install
   pnpm build
   ```

2. **Web Package**
   ```bash
   cd ../web
   pnpm install
   ```

3. **Cloud Functions**
   ```bash
   cd ../../cloud-functions/functions
   npm install
   npm run build
   ```

## Step 10: Set Up Custom Claims (Initial Admin)

1. **Create Admin User via Firebase Console**
   - Go to Authentication > Users
   - Create user with email/password

2. **Set Custom Claims via Cloud Function**
   - Use Firebase Console > Functions > `updateUserCustomClaims`
   - Or create a one-time script:
   ```javascript
   const admin = require('firebase-admin');
   admin.initializeApp();
   admin.auth().setCustomUserClaims('user-uid', { role: 'admin' });
   ```

## Step 11: Test Configuration

1. **Test Authentication**
   ```bash
   cd packages/web
   pnpm dev
   # Try to sign up/login
   ```

2. **Test Firestore Rules**
   - Try creating a pet
   - Try creating a booking
   - Verify rules are enforced

3. **Test Cloud Functions**
   - Check function logs: `firebase functions:log`
   - Test manually via Firebase Console

## Step 12: Production Deployment

1. **Build Web App**
   ```bash
   cd packages/web
   pnpm build
   ```

2. **Deploy to Firebase Hosting**
   ```bash
   cd ../../cloud-functions
   firebase deploy --only hosting
   ```

3. **Deploy Everything**
   ```bash
   firebase deploy
   ```

## Environment-Specific Configuration

### Development
- Use `.env` file with development Firebase project
- Enable Firebase Emulator Suite for local testing

### Production
- Use production Firebase project
- Set environment variables in CI/CD pipeline
- Enable Firebase App Check for additional security

## Security Checklist

- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Cloud Functions configured with secrets
- [ ] Custom claims set for admin users
- [ ] API keys stored securely (not in code)
- [ ] CORS configured for web app
- [ ] Firebase App Check enabled (optional but recommended)

## Troubleshooting

### Common Issues

1. **Functions not deploying**
   - Check Node.js version (requires 18)
   - Verify `firebase.json` configuration
   - Check function logs for errors

2. **Security rules too restrictive**
   - Test rules in Firebase Console > Rules Playground
   - Check custom claims are set correctly

3. **Storage upload fails**
   - Verify storage rules
   - Check bucket permissions
   - Verify file size limits

4. **Build errors**
   - Run `pnpm install` in all packages
   - Clear `node_modules` and reinstall
   - Check TypeScript version compatibility

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)


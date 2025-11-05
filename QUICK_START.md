# Quick Start Guide

## 🚀 Fastest Path to Running the App

### 1. Install Prerequisites (5 minutes)

```bash
# Install Node.js 18+ from https://nodejs.org/
# Install pnpm globally
npm install -g pnpm firebase-tools

# Verify installations
node --version    # Should be 18+
pnpm --version    # Should be 8+
firebase --version
```

### 2. Clone and Setup (2 minutes)

```bash
git clone https://github.com/dvsreddy82/PET-MANAGEMENT.git
cd PET-MANAGEMENT
pnpm install
```

### 3. Create Firebase Project (5 minutes)

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter name: `pet-management-cloud`
4. Click **"Create project"**

### 4. Enable Services (3 minutes)

In Firebase Console:
- **Authentication** → Enable Email/Password
- **Firestore** → Create database (test mode)
- **Storage** → Enable (test mode)
- **Functions** → Get started (enables billing)

### 5. Get Firebase Config (2 minutes)

1. Firebase Console → **Project Settings** (gear icon)
2. **"Your apps"** → Click **Web** icon (</>)
3. Register app: `pet-management-web`
4. **Copy config values**

### 6. Configure Environment (1 minute)

```bash
# Create .env file
cat > .env << EOF
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id-here
EOF

# Edit .env with your actual values
```

### 7. Login to Firebase (1 minute)

```bash
firebase login
```

### 8. Initialize Firebase (2 minutes)

```bash
cd cloud-functions
firebase init

# Select:
# - Firestore
# - Functions
# - Storage
# - Use existing project
# - Select your project
# - TypeScript
# - Yes to ESLint
# - Yes to install dependencies
```

### 9. Build Shared Package (1 minute)

```bash
cd ../packages/shared
pnpm build
cd ../..
```

### 10. Deploy Firebase Rules (2 minutes)

```bash
cd cloud-functions
firebase deploy --only firestore:rules,storage
```

### 11. Run Web App (1 minute)

```bash
cd ../packages/web
pnpm dev
```

✅ **Open http://localhost:3000 and test signup!**

---

## 📋 Configuration Checklist

Use this to track your progress:

- [ ] Node.js 18+ installed
- [ ] pnpm installed globally
- [ ] Firebase CLI installed
- [ ] Repository cloned
- [ ] Dependencies installed (`pnpm install`)
- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] Cloud Functions enabled
- [ ] Firebase config copied
- [ ] `.env` file created with config
- [ ] Firebase CLI logged in
- [ ] Firebase initialized (`firebase init`)
- [ ] Shared package built
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Web app running (`pnpm dev`)

---

## 🐛 Common Issues

### "Firebase not initialized"
→ Check `.env` file has correct values
→ Rebuild shared: `cd packages/shared && pnpm build`

### "Firestore permission denied"
→ Deploy rules: `firebase deploy --only firestore:rules`

### "Functions deployment fails"
→ Check billing is enabled in Firebase Console

### "Module not found"
→ Rebuild shared package: `cd packages/shared && pnpm build`

---

## 📚 Next Steps

1. **Test Features**: Sign up, add pet, create booking
2. **Deploy Functions**: `cd cloud-functions && firebase deploy --only functions`
3. **Configure Mobile**: See `SETUP_GUIDE.md` Step 12
4. **Configure Desktop**: See `SETUP_GUIDE.md` Step 13

---

## ⏱️ Total Time Estimate

- **Minimum setup**: ~25 minutes (web app only)
- **Full setup**: ~45 minutes (web + mobile + desktop + functions)

---

## 📖 Detailed Guide

For complete step-by-step instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)


# Firebase Emulator Setup Guide

This guide explains how to use Firebase Emulators for local development.

## Overview

Firebase Emulators allow you to develop and test your application locally without using production Firebase resources. This is especially useful for:
- Testing without affecting production data
- Faster development cycles
- Offline development
- Cost savings (no Firebase usage during development)

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Node.js 18+ installed
- All project dependencies installed: `pnpm install`

## Quick Start

### 1. Start Emulators

```bash
# From project root
pnpm emulators:start

# Or use the script directly
./scripts/start-emulators.sh

# Or from cloud-functions directory
cd cloud-functions
firebase emulators:start
```

### 2. Emulator Ports

Once started, the emulators will be available at:

- **Emulator UI**: http://localhost:4000 (Main dashboard)
- **Firestore**: localhost:8081
- **Authentication**: localhost:9099
- **Storage**: localhost:9199
- **Functions**: localhost:5001

### 3. Configure Your App

The Firebase configuration automatically connects to emulators when:
- `NODE_ENV=development` (default in dev mode)
- OR `USE_FIREBASE_EMULATOR=true` environment variable is set

You can explicitly enable emulators by setting:
```bash
export USE_FIREBASE_EMULATOR=true
```

### 4. Run Your Application

In a separate terminal, start your app:

```bash
# Web app
pnpm dev:web

# Desktop app
pnpm dev:desktop

# Mobile app (React Native)
pnpm dev:mobile
```

## Emulator Features

### Emulator UI

The Emulator UI (http://localhost:4000) provides:
- **Firestore**: View and edit data, test queries
- **Authentication**: Manage users, test sign-in flows
- **Storage**: Upload/download files, view storage structure
- **Functions**: View function logs and triggers
- **Logs**: Real-time logs from all emulators

### Data Persistence

By default, emulator data is stored in memory and cleared when emulators stop. To persist data:

1. Create a `.firebaserc` file in `cloud-functions/` (already exists)
2. Data will be stored in `cloud-functions/.firebase/` directory
3. Data persists between emulator restarts

### Import/Export Data

You can save and restore emulator data:

```bash
# Export emulator data
firebase emulators:export ./emulator-data

# Import emulator data
firebase emulators:start --import=./emulator-data

# Auto-import on start
firebase emulators:start --import=./emulator-data --export-on-exit
```

## Configuration

### Emulator Ports

Ports are configured in `cloud-functions/firebase.json`:

```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### Firebase Config

The Firebase configuration automatically detects development mode and connects to emulators. See `packages/shared/src/config/firebase.ts` for details.

## Testing with Emulators

### Test Authentication

1. Start emulators
2. Open Emulator UI → Authentication
3. Create test users or use your app's sign-up flow
4. Users are isolated from production

### Test Firestore

1. Start emulators
2. Open Emulator UI → Firestore
3. Create collections and documents
4. Test queries and rules locally

### Test Storage

1. Start emulators
2. Open Emulator UI → Storage
3. Upload files through your app
4. Files are stored locally

### Test Functions

1. Start emulators with functions:
   ```bash
   firebase emulators:start --only functions
   ```
2. Functions run locally and connect to other emulators
3. View logs in Emulator UI

## Troubleshooting

### Port Already in Use

If a port is already in use, you can change it in `firebase.json`:

```json
{
  "emulators": {
    "firestore": { "port": 8081 }
  }
}
```

### Emulators Not Connecting

1. Verify emulators are running: Check http://localhost:4000
2. Check environment variables: `echo $NODE_ENV`
3. Verify Firebase config: Check `packages/shared/src/config/firebase.ts`
4. Check browser console for connection errors

### Functions Not Working

1. Build functions first:
   ```bash
   cd cloud-functions/functions
   pnpm build
   ```
2. Start emulators with functions:
   ```bash
   firebase emulators:start --only functions,firestore,auth
   ```

## Production vs Development

### Development (Emulators)
- Uses local emulators
- Data stored locally
- No Firebase costs
- Faster development

### Production
- Uses real Firebase services
- Uses production data
- Requires Firebase project
- Real Firebase costs

To switch to production:
1. Stop emulators
2. Set `NODE_ENV=production`
3. Or unset `USE_FIREBASE_EMULATOR`

## Best Practices

1. **Always use emulators for development** - Protects production data
2. **Export data regularly** - Save test data for reuse
3. **Test rules locally** - Firestore and Storage rules work in emulators
4. **Use Emulator UI** - Visual interface for debugging
5. **Keep emulators running** - Faster development cycle

## Additional Resources

- [Firebase Emulator Documentation](https://firebase.google.com/docs/emulator-suite)
- [Firebase Emulator UI](https://firebase.google.com/docs/emulator-suite/install_and_validate)
- [Local Testing Guide](https://firebase.google.com/docs/emulator-suite/connect_and_prototype)


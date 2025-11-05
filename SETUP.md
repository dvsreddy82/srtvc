# Quick Setup Guide

## Prerequisites

- Node.js 18+ 
- pnpm (or npm)
- Firebase CLI: `npm install -g firebase-tools`

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd PET-MANAGEMENT
   pnpm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase config
   ```

3. **Firebase Setup**
   ```bash
   cd cloud-functions
   firebase login
   firebase use --add  # Select your Firebase project
   ```

4. **Configure Cloud Functions**
   ```bash
   firebase functions:config:set backup.bucket_name="pet-management-backups"
   firebase functions:config:set veterinarian.api_key="your-api-key"
   firebase functions:config:set veterinarian.webhook_secret="your-secret"
   ```

5. **Build Shared Package**
   ```bash
   cd ../packages/shared
   pnpm build
   ```

6. **Deploy Firebase Services**
   ```bash
   cd ../../cloud-functions
   firebase deploy
   ```

7. **Run Development Server**
   ```bash
   cd ../packages/web
   pnpm dev
   ```

## Detailed Configuration

See [CONFIGURATION.md](./CONFIGURATION.md) for detailed setup instructions.

## Project Structure

```
PET-MANAGEMENT/
├── packages/
│   ├── shared/          # Shared business logic
│   ├── web/            # React web app
│   ├── mobile/         # React Native app
│   └── desktop/        # Electron app
├── cloud-functions/    # Firebase Cloud Functions
│   ├── functions/      # Function source code
│   ├── firestore.rules
│   ├── storage.rules
│   └── firebase.json
├── .env.example        # Environment template
├── .firebaserc         # Firebase project config
└── CONFIGURATION.md    # Detailed config guide
```

## Next Steps

1. Create admin user and set custom claims
2. Initialize master data (breeds, vaccine types)
3. Test all features
4. Deploy to production

For more details, see [CONFIGURATION.md](./CONFIGURATION.md).


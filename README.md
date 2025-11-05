# Pet Management Cloud

A comprehensive pet management platform built with React, React Native, Electron, and Firebase. This application helps pet owners, kennel staff, veterinarians, and administrators manage pet care, bookings, medical records, and more.

## 🏗️ Architecture

- **Frontend**: React (Web) + React Native (iOS/Android) + Electron (Desktop)
- **Backend**: Firebase (Auth, Firestore, Storage, Functions, FCM)
- **Monorepo**: Workspace-based with shared codebase
- **Cost Optimized**: Local-first architecture targeting $4-11/month

## 📁 Project Structure

```
pet-management-app/
├── packages/
│   ├── shared/          # Shared business logic, services, models
│   ├── web/             # React Web App
│   ├── mobile/          # React Native App (iOS/Android)
│   └── desktop/         # Electron App (macOS/Windows/Linux)
├── cloud-functions/     # Firebase Cloud Functions
└── package.json         # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 (or pnpm/yarn)
- Firebase account and project
- For mobile: Xcode (iOS) and Android Studio (Android)
- For desktop: No additional requirements

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PET-MANAGEMENT
   ```

2. **Install dependencies**
   ```bash
   npm install
   # Or with pnpm
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

4. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, Storage, and Cloud Functions
   - Copy your Firebase config to `.env` file
   - Update `packages/shared/src/config/firebase.ts` with your config

### Development

#### Web App
```bash
cd packages/web
npm install
npm run dev
# App runs on http://localhost:3000
```

#### Mobile App
```bash
cd packages/mobile
npm install

# iOS
npm run ios

# Android
npm run android
```

#### Desktop App
```bash
cd packages/desktop
npm install
npm run dev
```

### Building for Production

#### Web
```bash
cd packages/web
npm run build
# Output in packages/web/dist
```

#### Mobile
```bash
cd packages/mobile
# iOS
npm run build:ios

# Android
npm run build:bundle
```

#### Desktop
```bash
cd packages/desktop
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

## 🔧 Configuration

### Quick Setup

For a quick start, run the setup script:
```bash
./scripts/setup.sh
```

Or follow the detailed guide in [CONFIGURATION.md](./CONFIGURATION.md).

### Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Firebase credentials (see [ENV_SETUP.md](./ENV_SETUP.md))

### Firebase Setup

See [CONFIGURATION.md](./CONFIGURATION.md) for detailed Firebase setup instructions including:
- Firebase project creation
- Security rules deployment
- Cloud Functions configuration
- Storage bucket setup
- Index creation

## 📱 Features

### Pet Owners
- ✅ Account creation and authentication
- ✅ Pet registration and management
- ✅ Vaccine and medical record tracking
- ✅ Kennel booking and search
- ✅ Stay updates and notifications
- ✅ Invoice and booking history
- ✅ Reviews and ratings

### Kennel Staff
- ✅ Daily check-ins view
- ✅ Pet check-in/check-out
- ✅ Daily photos and notes upload
- ✅ Stay updates management

### Managers
- ✅ Kennel capacity configuration
- ✅ Reports and analytics
- ✅ Staff management

### Veterinarians
- ✅ Medical record submission
- ✅ Webhook integration for clinic systems
- ✅ Medical history access

### Administrators
- ✅ Master data management
- ✅ System monitoring
- ✅ User support and role management

## 🗄️ Local-First Architecture

The app uses a local-first approach to minimize Firebase costs:

- **IndexedDB (Web)** / **SQLite (Mobile/Desktop)**: Primary data storage
- **Firestore**: Used only for sync operations
- **File System**: Cached invoices and documents
- **Sync Strategy**: Background sync with intelligent batching

This reduces Firestore reads by 85-95%, targeting costs of $4-11/month.

## 📊 Cost Optimization

- Local-first storage (IndexedDB/SQLite)
- Batch sync operations
- Image compression before upload
- Pagination and caching
- Offline-first functionality

Expected monthly cost: **$4-11/month** (medium scale)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests (when configured)
npm run test:e2e
```

## 📦 Deployment

### Web
```bash
cd packages/web
npm run build
firebase deploy --only hosting
```

### Mobile
- **iOS**: Build in Xcode → App Store Connect
- **Android**: Upload bundle to Google Play Console

### Desktop
```bash
cd packages/desktop
npm run build:mac    # or :win, :linux
```

## 🔐 Security

- Firebase Security Rules for Firestore and Storage
- Role-based access control (RBAC)
- JWT tokens via Firebase Auth
- Secure API endpoints

## 📚 Documentation

- **[CONFIGURATION.md](./CONFIGURATION.md)** - Complete configuration guide
- **[SETUP.md](./SETUP.md)** - Quick setup instructions
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables setup
- **[Pet Management Cloud.md](./Pet%20Management%20Cloud.md)** - Detailed requirements, user stories, and architecture
- **[IMPLEMENTATION_TRACKER.md](./IMPLEMENTATION_TRACKER.md)** - User story implementation status

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

[Add your license here]

## 🆘 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using React, React Native, Electron, and Firebase**


# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id

# Resend API (for email notifications)
RESEND_API_KEY=your-resend-api-key

# Stripe/PayPal (for payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
PAYPAL_CLIENT_ID=your-paypal-client-id
```

## Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on Web app icon (</>) to get web config
6. Copy the config values to your `.env` file

## For React Native

You'll also need to:
1. Download `google-services.json` for Android (place in `packages/mobile/android/app/`)
2. Download `GoogleService-Info.plist` for iOS (place in `packages/mobile/ios/`)


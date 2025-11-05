import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

// Type guard for Vite environment
interface ViteEnv {
  [key: string]: any;
  MODE?: string;
}

// Helper to get environment variables (works in both Node.js and browser)
function getEnv(key: string, defaultValue: string = ''): string {
  // Check for Vite environment variables (browser)
  if (typeof import.meta !== 'undefined') {
    const meta = import.meta as { env?: ViteEnv };
    if (meta.env) {
      const viteKey = `VITE_${key}`;
      if (meta.env[viteKey]) {
        return String(meta.env[viteKey]);
      }
    }
  }
  // Check for Node.js process.env
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) {
      return process.env[key];
    }
  }
  return defaultValue;
}

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY', "your-api-key"),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN', "your-project.firebaseapp.com"),
  projectId: getEnv('FIREBASE_PROJECT_ID', "your-project-id"),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET', "your-project.appspot.com"),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID', "123456789"),
  appId: getEnv('FIREBASE_APP_ID', "your-app-id")
};

// Check if we should use emulators (development mode)
const getEnvBool = (key: string): boolean => {
  if (typeof import.meta !== 'undefined') {
    const meta = import.meta as { env?: ViteEnv };
    if (meta.env) {
      const viteKey = `VITE_${key}`;
      if (meta.env[viteKey]) {
        return meta.env[viteKey] === 'true';
      }
    }
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] === 'true';
  }
  return false;
};

const useEmulators = 
  (typeof import.meta !== 'undefined' && (import.meta as { env?: ViteEnv }).env?.MODE === 'development') ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
  getEnvBool('USE_FIREBASE_EMULATOR');

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

export function initializeFirebase(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
    
    if (useEmulators) {
      // Connect to Firestore emulator
      if (!firestore) {
        firestore = getFirestore(app);
        try {
          connectFirestoreEmulator(firestore, 'localhost', 8081);
        } catch (error) {
          // Emulator already connected, ignore error
        }
      }
      
      // Connect to Auth emulator
      if (!auth) {
        auth = getAuth(app);
        try {
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        } catch (error) {
          // Emulator already connected, ignore error
        }
      }
      
      // Connect to Storage emulator
      if (!storage) {
        storage = getStorage(app);
        try {
          connectStorageEmulator(storage, 'localhost', 9199);
        } catch (error) {
          // Emulator already connected, ignore error
        }
      }
    } else {
      firestore = getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);
    }
  }
  return app;
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    return initializeFirebase();
  }
  return app;
}

export function getFirestoreInstance(): Firestore {
  if (!firestore) {
    initializeFirebase();
  }
  return firestore!;
}

export function getAuthInstance(): Auth {
  if (!auth) {
    initializeFirebase();
  }
  return auth!;
}

export function getStorageInstance(): FirebaseStorage {
  if (!storage) {
    initializeFirebase();
  }
  return storage!;
}

export { firebaseConfig };


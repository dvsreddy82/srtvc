import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Load from root .env file
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, '../shared/src'),
      },
    },
    server: {
      port: 5200,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    define: {
      // Make environment variables available as process.env for the shared package
      'process.env.FIREBASE_API_KEY': JSON.stringify(env.FIREBASE_API_KEY || ''),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.FIREBASE_AUTH_DOMAIN || ''),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.FIREBASE_PROJECT_ID || ''),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.FIREBASE_STORAGE_BUCKET || ''),
      'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.FIREBASE_MESSAGING_SENDER_ID || ''),
      'process.env.FIREBASE_APP_ID': JSON.stringify(env.FIREBASE_APP_ID || ''),
      'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
      'process.env.USE_FIREBASE_EMULATOR': JSON.stringify(env.USE_FIREBASE_EMULATOR || 'true'),
    },
    optimizeDeps: {
      // Don't pre-bundle firebase/messaging - let it load dynamically when needed
      exclude: ['firebase/messaging'],
    },
  };
});


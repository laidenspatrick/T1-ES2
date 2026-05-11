import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mfe_auth',
      filename: 'remoteEntry.js',
      exposes: {
        './LoginPage': './src/pages/LoginPage',
        './RegisterPage': './src/pages/RegisterPage',
        './AccountPage': './src/pages/AccountPage',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: {
    minify: false,
    target: 'esnext',
  },
  server: {
    port: 4001,
  },
  preview: {
    port: 4001,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served under /PhoneP2C/b2b/ once deployed next to the B2C app; override with B2B_BASE.
  base: process.env.B2B_BASE || '/',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      // Phone reference data is shared with the B2C app (single source of truth).
      '@shared': path.resolve(import.meta.dirname, '../src/data'),
    },
  },
  server: {
    port: 5174,
    fs: { allow: ['..'] },
  },
});

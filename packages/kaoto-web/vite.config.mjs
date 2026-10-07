// @ts-check
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

import packageJson from './package.json';
import { getLastCommitInfo } from './scripts/get-last-commit-info.mjs';

// https://vite.dev/config/
const lastCommitInfo = await getLastCommitInfo();

export default defineConfig({
  base: process.env.VITE_BASE_URL ?? '/',
  plugins: [react()],
  define: {
    __GIT_HASH: JSON.stringify(lastCommitInfo.hash),
    __GIT_DATE: JSON.stringify(lastCommitInfo.date),
    __KAOTO_VERSION: JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // For linking forms
      '@kaoto/forms': fileURLToPath(new URL('../forms/src/index.ts', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['mixed-decls'],
      },
    },
  },
});

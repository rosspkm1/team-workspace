import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// Test-only config. Reuses the same @-path aliases as the app (via
// vite-tsconfig-paths) and renders components in jsdom so React Testing Library
// works with no server or DB. Kept separate from vite.config.ts so it does not
// affect the production build.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

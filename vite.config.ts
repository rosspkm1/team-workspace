import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// Path aliases (@components, @pages, @styles, @hooks, @utils) are sourced from
// tsconfig.json via vite-tsconfig-paths so the alias map lives in exactly one place.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
});

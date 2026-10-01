import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const e2e = !!process.env.E2E;

export default defineConfig({
  resolve: {
    alias: {
      vscode: fileURLToPath(new URL('./test/mocks/vscode.ts', import.meta.url)),
    },
  },
  test: {
    include: e2e ? ['test/e2e/**/*.test.ts'] : ['test/tests/**/*.test.ts'],
    setupFiles: ['test/mocks/setup.ts'],
    testTimeout: e2e ? 60_000 : 5_000,
  },
});

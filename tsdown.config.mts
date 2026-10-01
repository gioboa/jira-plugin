import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  platform: 'node',
  target: 'node20',
  outDir: 'out/src',
  outExtensions: () => ({ js: '.js' }),
  dts: false,
  sourcemap: true,
  clean: true,
  // bundle every dependency (jira.js & co.) so the VSIX ships without node_modules
  deps: {
    neverBundle: ['vscode'],
    onlyBundle: false,
  },
});

import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['packages/**/*.test.ts'], environment: 'node', coverage: { include: ['packages/engines/src/**/*.ts'], exclude: ['**/*.test.ts', '**/*.worker.ts'] } } });

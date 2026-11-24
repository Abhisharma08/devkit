import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['release/**', '**/node_modules/**', '**/.next/**', '**/out/**', '**/.output/**', '**/.wxt/**', '**/coverage/**', '**/.turbo/**', '**/next-env.d.ts', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.worker } }, rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } }
);

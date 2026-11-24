import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  manifest: {
    name: 'DevKit: JSON Formatter & Developer Tools',
    description: '23 offline developer tools: JSON and SQL formatters, JWT decoder, Base64, UUIDs, regex and more. Local processing, no tracking.',
    version: '1.0.0',
    minimum_chrome_version: '116',
    icons: { 16: 'icon/16.png', 32: 'icon/32.png', 48: 'icon/48.png', 128: 'icon/128.png' },
    permissions: ['sidePanel'],
    content_security_policy: { extension_pages: "script-src 'self'; object-src 'none'; worker-src 'self'; connect-src 'none'; base-uri 'none'" },
    action: { default_title: 'Open DevKit' }
  },
  // Vite handles React's automatic JSX runtime; WXT reloads extension pages in development.
  vite: () => ({ plugins: [tailwindcss()], esbuild: { jsx: 'automatic', jsxImportSource: 'react' } })
});

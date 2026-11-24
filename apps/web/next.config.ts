import type { NextConfig } from 'next';
const config: NextConfig = { output: 'export', trailingSlash: true, reactStrictMode: true, transpilePackages: ['@devkit/ui', '@devkit/engines', '@devkit/config'], images: { unoptimized: true } };
export default config;

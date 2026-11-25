export const projectConfig = {
  name: 'DevKit',
  // Production origin only. A build-time NEXT_PUBLIC_SITE_URL can override this.
  websiteUrl: 'https://devkit.opervia.tech',
  chromeStoreUrl: 'https://chromewebstore.google.com/detail/nkdkijlcljjgomjaacoafjpbeeckbpim',
  // Optional. Example: https://www.buymeacoffee.com/your-handle
  donationUrl: 'https://buymeacoffee.com/abhimanyusharma',
} as const;

export { toolRoutes, toolPath } from './tool-routes';
export { siteOrigin, serializeJsonLd, pagesProductionOrigin } from './site-url';

export function validDonationUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['buymeacoffee.com', 'www.buymeacoffee.com'].includes(url.hostname) || url.username || url.password || url.port || !/^\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}

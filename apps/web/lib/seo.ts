import type { Metadata } from 'next';
import { projectConfig, siteOrigin, pagesProductionOrigin } from '@devkit/config';

// CF_PAGES_URL can contain a preview hostname. Canonicalize to the stable project
// origin only when Cloudflare is building the production main branch.
export const origin = siteOrigin(process.env.NEXT_PUBLIC_SITE_URL || projectConfig.websiteUrl ||
  pagesProductionOrigin(process.env.CF_PAGES_URL, process.env.CF_PAGES_BRANCH));
export const homeTitle = 'Free Developer Tools — JSON, SQL & More | DevKit';
export const homeDescription = '23 free developer tools: JSON formatter, SQL formatter, JWT decoder, Base64, UUIDs, regex, and more. All processing stays in your browser. No sign-up.';

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = origin ? `${origin}${path}` : undefined;
  const images = origin ? [{ url: `${origin}/social-card.png`, width: 1200, height: 630, alt: 'DevKit — free, local developer tools' }] : undefined;
  return {
    title: { absolute: title }, description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: { title, description, type: 'website', siteName: 'DevKit', locale: 'en_US', url, images },
    twitter: { card: 'summary_large_image', title, description, images: images?.map(image => image.url) },
  };
}

export function applicationSchema(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org', '@type': 'WebApplication', name, description,
    url: origin ? `${origin}${path}` : undefined,
    applicationCategory: 'DeveloperApplication', operatingSystem: 'Any',
    browserRequirements: 'Requires a modern browser with JavaScript and Web Crypto.',
    isAccessibleForFree: true, license: 'https://opensource.org/license/mit',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

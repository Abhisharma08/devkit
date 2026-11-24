import type { MetadataRoute } from 'next';
import { origin } from '../lib/seo';
import { toolPages } from '../lib/tool-content';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  // An unconfigured local build cannot truthfully announce production URLs.
  if (!origin) return [];
  return ['/', '/chrome-extension/', '/privacy/', ...toolPages.map(tool => tool.path)]
    .map(path => ({ url: `${origin}${path}` }));
}

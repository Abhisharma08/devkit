/** Accept only a production origin; never leak credentials or an arbitrary path into SEO tags. */
export function siteOrigin(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      url.pathname !== '/' || url.search || url.hash ||
      url.hostname === 'localhost' || !url.hostname.includes('.') ||
      url.hostname.endsWith('.example') || url.hostname === 'example.com') {
    throw new Error('Site URL must be a public HTTPS origin without a path, port, credentials, query, or fragment.');
  }
  return url.origin;
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** Pages can supply a deployment-specific URL; use the stable project alias. */
export function pagesProductionOrigin(value: string | undefined, branch: string | undefined): string | undefined {
  if (branch !== 'main' || !value) return undefined;
  const origin = siteOrigin(value);
  if (!origin) return undefined;
  const hostname = new URL(origin).hostname;
  if (!hostname.endsWith('.pages.dev')) return undefined;
  const labels = hostname.split('.');
  if (labels.length < 3 || labels.length > 4) return undefined;
  return `https://${labels.slice(-3).join('.')}`;
}

import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
const root = 'apps/web/out';
const home = await readFile(join(root, 'index.html'), 'utf8');
function attribute(tag, name) { return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]; }
function tags(html, tag) { return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map(match => match[0]); }
function canonical(html) { return tags(html, 'link').find(tag => attribute(tag, 'rel') === 'canonical'); }
const homepageCanonical = canonical(home);
const origin = homepageCanonical ? new URL(attribute(homepageCanonical, 'href')).origin : undefined;
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const robots = await readFile(join(root, 'robots.txt'), 'utf8');
const directories = (await readdir(join(root, 'tools'), { withFileTypes: true })).filter(entry => entry.isDirectory());
assert.equal(directories.length, 23, 'All MVP tools must have an exported page');
const titles = new Set();
const descriptions = new Set();
for (const path of ['/', '/privacy/', '/chrome-extension/', ...directories.map(entry => `/tools/${entry.name}/`)]) {
  const html = await readFile(join(root, path.slice(1), 'index.html'), 'utf8');
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `One visible page heading required: ${path}`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert(title && !titles.has(title), `Missing or duplicated title: ${path}`);
  titles.add(title);
  const description = attribute(tags(html, 'meta').find(tag => attribute(tag, 'name') === 'description') ?? '', 'content');
  assert(description && !descriptions.has(description), `Missing or duplicated description: ${path}`);
  descriptions.add(description);
  const link = canonical(html);
  if (origin) {
    assert.equal(attribute(link ?? '', 'href'), `${origin}${path}`, `Wrong canonical: ${path}`);
    assert(sitemap.includes(`<loc>${origin}${path}</loc>`), `Missing sitemap URL: ${path}`);
    assert(tags(html, 'meta').some(tag => attribute(tag, 'property') === 'og:image' && attribute(tag, 'content') === `${origin}/social-card.png`));
  } else assert(!link, 'Local build should not invent a canonical');
  if (path.startsWith('/tools/')) {
    assert(home.includes(`href="${path}"`), `Tool cannot be discovered from the homepage: ${path}`);
    assert(html.includes('How to use this tool'));
    const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    assert(scripts.length, `Missing structured data: ${path}`);
    for (const [, json] of scripts) {
      const data = JSON.parse(json);
      const items = Array.isArray(data) ? data : [data];
      assert(items.some(item => item['@type'] === 'WebApplication'));
      if (origin) assert(items.some(item => item['@type'] === 'BreadcrumbList'));
    }
  }
  for (const link of tags(html, 'a')) {
    const href = attribute(link, 'href');
    if (href?.startsWith('/tools/')) await stat(join(root, href.slice(1), 'index.html'));
  }
}
assert(robots.includes('Allow: /'));
if (origin) {
  assert(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 26);
} else {
  assert(!sitemap.includes('<loc>'));
  console.warn('Production origin is unconfigured: canonical URLs and sitemap entries are intentionally omitted. Set NEXT_PUBLIC_SITE_URL before a manual production upload.');
}
const png = await readFile(join(root, 'social-card.png'));
assert.equal(png.readUInt32BE(16), 1200);
assert.equal(png.readUInt32BE(20), 630);
console.log(`SEO artifacts verified: ${directories.length} discoverable tool pages, unique metadata, local sharing image${origin ? ', canonical URLs and 26 sitemap entries' : ''}.`);

import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
const root = 'apps/extension/.output/chrome-mv3';
const manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert(manifest.name.length <= 75);
assert(manifest.description.length <= 132);
assert.deepEqual(manifest.permissions, ['sidePanel']);
assert.deepEqual(manifest.host_permissions ?? [], []);
assert(!manifest.content_security_policy.extension_pages.includes('unsafe-eval'));
assert(!manifest.content_security_policy.extension_pages.includes('unsafe-inline'));
assert(manifest.content_security_policy.extension_pages.includes("connect-src 'none'"));
assert(!manifest.content_scripts?.length);
for (const name of ['popup.html', 'sidepanel.html', 'workspace.html']) await stat(join(root, name));
for (const size of [16, 32, 48, 128]) assert(manifest.icons?.[size], `Missing ${size}px icon`);
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (/\.html$/.test(path)) {
      const content = await readFile(path, 'utf8');
      assert(!/<script[^>]+src=["']https?:/i.test(content), `Remote executable in ${path}`);
      assert(!/<script(?![^>]*src=)[^>]*>\s*\S/i.test(content), `Inline script in ${path}`);
    }
  }
}
await scan(root);
for (const path of ['apps/web/out/index.html', 'apps/web/out/privacy/index.html', 'apps/web/out/_headers']) await stat(path);
await import('./verify-seo.mjs');
console.log('Static website and least-privilege MV3 artifacts verified.');

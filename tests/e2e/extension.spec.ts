import { test, expect, chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
test('packaged MV3 extension runs each surface offline', async () => {
  const path = resolve('apps/extension/.output/chrome-mv3');
  const manifest = JSON.parse(await readFile(resolve(path, 'manifest.json'), 'utf8'));
  expect(manifest.manifest_version).toBe(3);
  expect(manifest.permissions).toEqual(['sidePanel']);
  expect(manifest.host_permissions ?? []).toEqual([]);
  expect(manifest.content_security_policy.extension_pages).not.toContain('unsafe-eval');
  const context = await chromium.launchPersistentContext('', { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${path}`, `--load-extension=${path}`] });
  try {
    const extensionPage = await context.newPage();
    await extensionPage.goto('chrome://extensions');
    const item = extensionPage.locator('extensions-item').first();
    await item.waitFor();
    const id = await item.getAttribute('id');
    expect(id).toMatch(/^[a-p]{32}$/);
    await context.setOffline(true);
    for (const surface of ['popup', 'sidepanel', 'workspace']) {
      const page = await context.newPage();
      await page.goto(`chrome-extension://${id}/${surface}.html#tool=json-formatter`);
      await page.getByRole('button', { name: 'Load example' }).click();
      await page.getByRole('button', { name: 'Format JSON', exact: true }).click();
      await expect(page.getByRole('textbox', { name: 'Tool result', exact: true }).last()).toContainText('DevKit');
      await page.close();
    }
  } finally { await context.close(); }
});

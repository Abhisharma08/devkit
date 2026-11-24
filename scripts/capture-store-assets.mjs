// Capture real extension pages; designed for the Linux CI runner with Chromium installed.
import { chromium } from '@playwright/test';
import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const output = resolve('release/store-assets');
await mkdir(output, { recursive: true });
const extension = resolve('apps/extension/.output/chrome-mv3');
const context = await chromium.launchPersistentContext('', {
  channel: 'chromium', headless: true, viewport: { width: 1280, height: 800 },
  args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`]
});
try {
  const manager = await context.newPage();
  await manager.goto('chrome://extensions');
  const item = manager.locator('extensions-item').first();
  await item.waitFor();
  const id = await item.getAttribute('id');
  if (!id || !/^[a-p]{32}$/.test(id)) throw new Error('Could not identify the loaded DevKit extension.');
  await context.setOffline(true);
  const page = await context.newPage();
  const prefix = `chrome-extension://${id}/workspace.html`;
  await page.goto(prefix);
  await page.getByRole('button', { name: 'Open JSON formatter', exact: true }).waitFor();
  await page.screenshot({ path: resolve(output, '01-tool-directory.png') });
  await page.goto(`${prefix}#tool=json-formatter`);
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Format JSON', exact: true }).click();
  await page.getByRole('textbox', { name: 'Tool result', exact: true }).last().waitFor();
  await page.screenshot({ path: resolve(output, '02-json-formatter.png') });
  await page.goto(`${prefix}#tool=uuid`);
  await page.getByRole('button', { name: 'Generate UUIDs', exact: true }).click();
  await page.getByRole('textbox', { name: 'Tool result', exact: true }).last().waitFor();
  await page.screenshot({ path: resolve(output, '03-uuid-generator.png') });
  await copyFile(resolve(extension, 'icon/128.png'), resolve(output, 'store-icon-128.png'));
  console.log('Captured three 1280×800 screenshots of the actual extension and copied its store icon.');
} finally { await context.close(); }

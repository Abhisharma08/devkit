import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projectConfig, validDonationUrl } from '../../packages/config/src/index';
const fixtures = [
  ['json-formatter', 'Format JSON', true], ['json-validator', 'Validate JSON', true], ['json-minifier', 'Minify JSON', true],
  ['sql-formatter', 'Format SQL', true], ['base64', 'Convert Base64', true], ['url', 'Convert URL', true], ['jwt', 'Decode JWT', true],
  ['uuid', 'Generate UUIDs', false], ['password', 'Generate password', false], ['qr', 'Generate QR code', true], ['sha', 'Generate hash', true],
  ['random-string', 'Generate string', false], ['timestamp', 'Convert timestamp', true], ['cron', 'Build cron expression', false],
  ['regex', 'Test expression', true], ['diff', 'Compare text', true], ['case', 'Convert case', true], ['word-count', 'Count text', true],
  ['color', 'Convert color', true], ['gradient', 'Generate gradient', false],
  ['curl-to-fetch', 'Convert to fetch', true], ['url-inspector', 'Inspect URL', true], ['number-base', 'Convert number', true],
] as const;
for (const [id, action, example] of fixtures) test(`${id} runs with a real engine`, async ({ page }) => {
  await page.goto(`/#tool=${id}`);
  if (example) await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: action, exact: true }).click();
  const output = page.getByRole('textbox', { name: 'Tool result', exact: true }).last();
  await expect(output).toBeVisible();
  await expect(output).not.toBeEmpty();
  await expect(page.getByRole('alert')).toHaveCount(0);
  if (id === 'jwt') await expect(output).toContainText('NOT verified');
  if (id === 'qr') await expect(page.getByAltText('Generated QR code')).toBeVisible();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByText('Your result will appear here')).toBeVisible();
});
test('search, categories and favorites work', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tool-card')).toHaveCount(fixtures.length);
  await page.getByRole('textbox', { name: 'Search tools' }).fill('checksum');
  await expect(page.locator('.tool-card')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'SHA hash generator' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('button', { name: 'Favorite JSON formatter', exact: true }).click();
  await page.getByRole('button', { name: /^Favorites\b/ }).first().click();
  await expect(page.locator('.tool-card')).toHaveCount(1);
  await page.reload();
  await page.getByRole('button', { name: /^Favorites\b/ }).first().click();
  await expect(page.getByRole('heading', { name: 'JSON formatter' })).toBeVisible();
});
test('invalid inputs show an error and a new edit clears stale output', async ({ page }) => {
  await page.goto('/#tool=json-formatter');
  const input = page.getByRole('textbox', { name: 'JSON input', exact: true }).last();
  await input.fill('{bad');
  await page.getByRole('button', { name: 'Format JSON', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await input.fill('{"secret":"test-only-value"}');
  await page.getByRole('button', { name: 'Format JSON', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Tool result', exact: true }).last()).toContainText('test-only-value');
  const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
  expect(storage).not.toContain('test-only-value');
  await input.fill('{}');
  await expect(page.getByText('Your result will appear here')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'JSON input', exact: true }).last()).not.toContainText('secret');
});
test('theme, shortcuts, dialogs and responsive layout', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.reload(); await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.keyboard.press('Control+k'); await expect(page.getByRole('textbox', { name: 'Search tools' })).toBeFocused();
  await page.keyboard.press('Escape'); await page.keyboard.press('?');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const donationUrl = validDonationUrl(projectConfig.donationUrl);
  if (donationUrl) {
    await expect(page.getByRole('link', { name: 'Support DevKit' })).toHaveAttribute('href', donationUrl);
  } else {
    await expect(page.getByRole('link', { name: /coffee|Support DevKit/ })).toHaveCount(0);
  }
});
test('regex timeout leaves the interface responsive and worker can recover', async ({ page }) => {
  await page.goto('/#tool=regex');
  await page.getByLabel('Pattern (without / delimiters)', { exact: true }).fill('(a+)+$');
  await page.getByLabel('Flags', { exact: true }).fill('');
  await page.getByRole('textbox', { name: 'Test text', exact: true }).last().fill('a'.repeat(40) + '!');
  await page.getByRole('button', { name: 'Test expression', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('750 ms');
  await page.getByLabel('Pattern (without / delimiters)', { exact: true }).fill('a+');
  await page.getByRole('button', { name: 'Test expression', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Tool result', exact: true }).last()).toContainText('matches');
});
test('processing emits no network requests', async ({ page }) => {
  await page.goto('/#tool=sha');
  await page.getByRole('button', { name: 'Load example' }).click();
  const requests: string[] = [];
  page.on('request', request => { if (['fetch', 'xhr', 'websocket'].includes(request.resourceType())) requests.push(request.url()); });
  await page.getByRole('button', { name: 'Generate hash', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Tool result', exact: true }).last()).toContainText('2cf24');
  expect(requests).toEqual([]);
});
test('dashboard and workspace meet automated accessibility checks', async ({ page }) => {
  await page.goto('/');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('link', { name: 'Open JSON formatter', exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('global search preserves the workspace until another tool is selected', async ({ page }) => {
  await page.goto('/#tool=json-formatter');
  const input = page.getByRole('textbox', { name: 'JSON input', exact: true }).last();
  await input.fill('{"draft":"keep-this-input"}');
  await page.getByRole('button', { name: 'Format JSON', exact: true }).click();
  const result = page.getByRole('textbox', { name: 'Tool result', exact: true }).last();
  await expect(result).toContainText('keep-this-input');
  const search = page.getByRole('textbox', { name: 'Search tools' });
  await search.fill('timestamp');
  await expect(page.locator('#tool-search-results')).toBeVisible();
  await expect(input).toContainText('keep-this-input');
  await expect(result).toContainText('keep-this-input');
  await page.keyboard.press('Escape');
  await expect(page.locator('#tool-search-results')).toHaveCount(0);
  await expect(result).toContainText('keep-this-input');
  await search.fill('timestamp');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Unix Timestamp & Epoch Converter', exact: true })).toBeFocused();
  await expect(page.getByText('Your result will appear here')).toBeVisible();
});

test('search dismisses when returning to the current editor', async ({ page }) => {
  await page.goto('/#tool=json-formatter');
  const input = page.getByRole('textbox', { name: 'JSON input', exact: true }).last();
  await input.fill('{"draft":true}');
  await page.getByRole('textbox', { name: 'Search tools' }).fill('uuid');
  await expect(page.locator('#tool-search-results')).toBeVisible();
  await input.focus();
  await expect(page.locator('#tool-search-results')).toHaveCount(0);
  await expect(input).toContainText('draft');
});

test('mobile navigation dismisses and restores keyboard focus', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Native drawer is used at narrow viewports.');
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'Open navigation' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Navigation', exact: true });
  await expect(dialog).toBeVisible();
  await expect(opener).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole('button', { name: /Favorites/ }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Favorites', exact: true })).toBeVisible();
});

test('number-base example restores compatible settings before running', async ({ page }) => {
  await page.goto('/#tool=number-base');
  await page.getByLabel('Input base', { exact: true }).selectOption('2');
  await page.getByRole('button', { name: 'Load example' }).click();
  await expect(page.getByLabel('Input base', { exact: true })).toHaveValue('10');
  await page.getByRole('button', { name: 'Convert number', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Tool result', exact: true }).last()).toContainText('FF');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('static tool links load the matching workspace and search metadata', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'Open JSON formatter', exact: true });
  await expect(link).toHaveAttribute('href', '/tools/json-formatter/');
  await link.click();
  await expect(page).toHaveURL(/\/tools\/json-formatter\/$/);
  await expect(page).toHaveTitle('JSON Formatter Online | DevKit');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('JSON Formatter Online');
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Format JSON', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Tool result', exact: true }).last()).not.toBeEmpty();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('JSON Formatter Online');
  await expect(page.getByRole('heading', { name: 'How to use this tool' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to tools', exact: true }).click();
  await expect(page.locator('.tool-card')).toHaveCount(fixtures.length);
});

test('tool-page category navigation returns to the selected home filter', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop sidebar; mobile drawer has separate coverage.');
  await page.goto('/tools/json-formatter/');
  await page.locator('.sidebar').getByRole('button', { name: /^Security\b/ }).click();
  await expect(page).toHaveURL(/\/#category=Security$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Security', exact: true })).toBeVisible();
  await expect(page.locator('.tool-card')).toHaveCount(3);
});

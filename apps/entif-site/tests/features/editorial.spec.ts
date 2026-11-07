import { readdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const prefix = '/articles/accelerating-the-dystopia/';
const routes = readdirSync(`dist${prefix}`, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => `${prefix}${entry.name}/`)
  .sort();

test('Dystopia chapter cards use chapter-specific descriptions and tags', async ({
  page,
}) => {
  await page.goto('/articles/');
  const cards = page.getByTestId(
    /^content-card-entif\.essay\.etr-2026-07\.\d{2}$/
  );
  await expect(cards).toHaveCount(16);

  const descriptions = await page
    .getByTestId(/^content-card-entif\.essay\.etr-2026-07\.\d{2}-description$/)
    .allTextContents();
  const tagSets = await page
    .getByTestId(/^content-card-entif\.essay\.etr-2026-07\.\d{2}-tags$/)
    .allTextContents();
  expect(descriptions).toHaveLength(16);
  expect(tagSets).toHaveLength(16);
  expect(new Set(descriptions.map((text) => text.trim())).size).toBe(16);
  expect(
    new Set(tagSets.map((text) => text.replace(/\s+/g, ' ').trim())).size
  ).toBe(16);
  expect(
    descriptions.some((text) => text.includes('Section 1 of Accelerating'))
  ).toBe(false);
});

test('Citations stays published but is hidden from the Articles index', async ({
  page,
}) => {
  const citationsRoute = `${prefix}17-citations/`;

  await page.goto('/articles/');
  await expect(
    page.getByTestId('content-card-entif.essay.etr-2026-07.17')
  ).toHaveCount(0);

  const response = await page.request.get(citationsRoute);
  expect(response.status()).toBe(200);

  await page.goto(citationsRoute);
  await expect(page.getByTestId('editorial-series')).toBeVisible();
  await expect(page.getByTestId('editorial-heading')).toContainText(
    'Citations'
  );
});

test('short article routes retain the editorial series treatment', async ({
  page,
}) => {
  for (const route of routes) {
    const slug = route.slice(prefix.length, -1);
    await page.goto(`/articles/${slug}/`);
    await expect(page.getByTestId('editorial-series')).toBeVisible();
  }
});

test('citation disclosure opens, dismisses, and follows its registry destination', async ({
  page,
}) => {
  const first = routes[0];
  if (!first) throw new Error('No generated editorial routes');
  await page.goto(first);
  const trigger = page.getByTestId('editorial-citation-1-1-trigger');
  const panel = page.getByTestId('editorial-citation-1-1-panel');
  await trigger.focus();
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  const reference = page.getByTestId('editorial-citation-1-1-reference-S173');
  const destination = await reference.getAttribute('href');
  await reference.click();
  await expect(page).toHaveURL(
    new RegExp(`${destination?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
  );
});

test('touch citation opens and closes without depending on hover', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322' + routes[0]);
  await page.getByTestId('editorial-citation-1-1-trigger').tap();
  const panel = page.getByTestId('editorial-citation-1-1-panel');
  await expect(panel).toBeVisible();
  await page.getByTestId('editorial-citation-1-1-close').tap();
  await expect(panel).not.toBeVisible();
  await context.close();
});

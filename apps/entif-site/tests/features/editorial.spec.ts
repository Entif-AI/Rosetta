import { readdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const prefix = '/articles/accelerating-the-dystopia/';
const routes = readdirSync(`dist${prefix}`, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => `${prefix}${entry.name}/`)
  .sort();

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
  const trigger = page.getByTestId('citation-trigger').first();
  const panel = page.getByTestId('citation-panel').first();
  await trigger.focus();
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  const reference = panel.getByTestId('citation-reference').first();
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
  await page.getByTestId('citation-trigger').first().tap();
  const panel = page.getByTestId('citation-panel').first();
  await expect(panel).toBeVisible();
  await panel.getByTestId('citation-close').tap();
  await expect(panel).not.toBeVisible();
  await context.close();
});

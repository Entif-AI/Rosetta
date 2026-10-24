import { expect, test } from '@playwright/test';

test('image-led cards enrich home and publication indexes with spaced artwork reuse', async ({
  page,
}) => {
  await page.goto('/');

  const homeCards = page.locator(
    '.home-research-grid .content-card, .home-project-grid .content-card'
  );
  await expect(homeCards).toHaveCount(6);
  const homeArtwork = await homeCards.evaluateAll((cards) =>
    cards.map((card) => card.getAttribute('data-card-artwork'))
  );
  expect(new Set(homeArtwork).size).toBe(homeArtwork.length);
  for (const card of await homeCards.all()) {
    await expect(card.locator('.content-card-image')).toBeVisible();
    await expect(card.locator('.content-card-image')).toHaveAttribute(
      'alt',
      ''
    );
    await expect(card.locator('.content-card-action')).toBeVisible();
  }

  await page.goto('/research/');
  const researchCards = page.locator('.card-grid .content-card');
  expect(await researchCards.count()).toBeGreaterThan(0);
  await expect(researchCards.first().locator('h2')).toBeVisible();
  await expect(
    researchCards.first().locator('.content-card-image')
  ).toBeVisible();

  await page.goto('/articles/');
  const articleCards = page.locator('.card-grid .content-card');
  expect(await articleCards.count()).toBeGreaterThanOrEqual(15);
  const firstCycle = await articleCards.evaluateAll((cards) =>
    cards.slice(0, 15).map((card) => card.getAttribute('data-card-artwork'))
  );
  expect(new Set(firstCycle).size).toBe(15);
});

test('archive keeps chronological grouping while using compact illustrated cards', async ({
  page,
}) => {
  await page.goto('/archive/');
  const compactCards = page.locator(
    '.archive-entry-list .content-card--compact'
  );
  expect(await compactCards.count()).toBeGreaterThan(0);
  await expect(
    compactCards.first().locator('.content-card-image')
  ).toBeVisible();
  await expect(
    compactCards.first().locator('[data-test-id="archive-entry-link"]')
  ).toBeVisible();
});

test('Atlas hero subtitle is a semantic second-level heading', async ({
  page,
}) => {
  await page.goto(
    '/articles/agentic-aberrancy-atlas/03-memory-without-continuity/'
  );
  await expect(page.locator('.hero-copy > h1')).toBeVisible();
  await expect(page.locator('.hero-copy > h2.subtitle')).toHaveText(
    'An Agentic Aberrancy Atlas Shrugged'
  );
  await expect(page.locator('.hero-copy > p.subtitle')).toHaveCount(0);
});

test('illustrated card surfaces reflow without horizontal document overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/research/', '/articles/', '/archive/']) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth
      )
    ).toBe(true);
    await expect(page.locator('.content-card').first()).toBeVisible();
    await expect(page.locator('.content-card-image').first()).toBeVisible();
  }
});

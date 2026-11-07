import { expect, test } from '@playwright/test';

test('image-led cards enrich home and publication indexes with spaced artwork reuse', async ({
  page,
}) => {
  await page.goto('/');

  const homeArtwork = await page
    .getByTestId(/^content-card-/)
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const artwork = element.getAttribute('data-card-artwork');
        return artwork ? [artwork] : [];
      })
    );
  expect(homeArtwork).toHaveLength(6);
  expect(new Set(homeArtwork).size).toBe(homeArtwork.length);
  const homeImages = page.getByTestId(/^content-card-.*-image$/);
  await expect(homeImages).toHaveCount(6);
  for (const image of await homeImages.all()) {
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('alt', '');
  }
  await expect(page.getByTestId(/^content-card-.*-action$/)).toHaveCount(6);

  await page.goto('/research/');
  expect(
    await page.getByTestId(/^content-card-.*-heading$/).count()
  ).toBeGreaterThan(0);
  expect(
    await page.getByTestId(/^content-card-.*-image$/).count()
  ).toBeGreaterThan(0);

  await page.goto('/articles/');
  const firstCycle = await page
    .getByTestId(/^content-card-/)
    .evaluateAll((elements) =>
      elements
        .flatMap((element) => {
          const artwork = element.getAttribute('data-card-artwork');
          return artwork ? [artwork] : [];
        })
        .slice(0, 15)
    );
  expect(firstCycle.length).toBeGreaterThanOrEqual(15);
  expect(new Set(firstCycle).size).toBe(15);
});

test('archive keeps chronological grouping while using compact illustrated cards', async ({
  page,
}) => {
  await page.goto('/archive/');
  expect(
    await page.getByTestId(/^archive-entry-link-/).count()
  ).toBeGreaterThan(0);
  expect(
    await page.getByTestId(/^content-card-.*-image$/).count()
  ).toBeGreaterThan(0);
});

test('Atlas hero subtitle is a semantic second-level heading', async ({
  page,
}) => {
  await page.goto(
    '/articles/agentic-aberrancy-atlas/03-memory-without-continuity/'
  );
  const subtitle = page.getByTestId('atlas-hero-subtitle');
  await expect(subtitle).toHaveText('An Agentic Aberrancy Atlas Shrugged');
  expect(await subtitle.evaluate((element) => element.tagName)).toBe('H2');
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
    expect(
      await page.getByTestId(/^content-card-.*-image$/).count()
    ).toBeGreaterThan(0);
  }
});

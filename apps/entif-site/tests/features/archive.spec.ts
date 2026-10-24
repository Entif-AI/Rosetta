import { expect, test } from '@playwright/test';

test('archive groups published content by month and date with linked titles', async ({
  page,
}) => {
  await page.goto('/archive/');

  const monthSections = page.locator('[data-test-id="archive-month"]');
  expect(await monthSections.count()).toBeGreaterThan(0);

  const monthKeys = await monthSections.evaluateAll((sections) =>
    sections.map((section) => section.getAttribute('data-month'))
  );
  expect(monthKeys).toEqual([...monthKeys].sort().reverse());

  for (const section of await monthSections.all()) {
    await expect(
      section.locator('[data-test-id="archive-month-heading"]')
    ).toBeVisible();
    const monthKey = await section.getAttribute('data-month');
    const sectionDates = await section
      .locator('time')
      .evaluateAll((times) =>
        times.map((time) => time.getAttribute('datetime'))
      );
    expect(sectionDates.every((date) => date?.startsWith(monthKey ?? ''))).toBe(
      true
    );
  }

  const dateRows = page.locator('[data-test-id="archive-date"]');
  const datetimes = await dateRows
    .locator('time')
    .evaluateAll((times) => times.map((time) => time.getAttribute('datetime')));
  expect(datetimes).toEqual([...datetimes].sort().reverse());

  for (const row of await dateRows.all()) {
    expect(
      await row.locator('[data-test-id="archive-entry-link"]').count()
    ).toBeGreaterThan(0);
  }

  const knownDate = page.locator(
    '[data-test-id="archive-date"][data-date="2026-10-24"]'
  );
  const knownEntry = knownDate.locator(
    '[data-test-id="archive-entry-link"][href="/articles/agentic-aberrancy-atlas/01-what-happened-to-us/"]'
  );
  await expect(knownEntry).toHaveText('What Happened to Us');
  await expect(knownEntry).toHaveAttribute(
    'href',
    '/articles/agentic-aberrancy-atlas/01-what-happened-to-us/'
  );
});

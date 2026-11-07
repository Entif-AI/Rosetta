import { expect, test } from '@playwright/test';

test('archive groups published content by month and date with linked titles', async ({
  page,
}) => {
  await page.goto('/archive/');

  const monthSections = page.getByTestId(/^archive-month-\d{4}-\d{2}$/);
  expect(await monthSections.count()).toBeGreaterThan(0);

  const monthKeys = await monthSections.evaluateAll((sections) =>
    sections.map((section) => section.getAttribute('data-month'))
  );
  expect(monthKeys).toEqual([...monthKeys].sort().reverse());

  for (const section of await monthSections.all()) {
    const monthKey = await section.getAttribute('data-month');
    if (!monthKey) throw new Error('Archive month is missing its month key');
    await expect(
      page.getByTestId(`archive-month-heading-${monthKey}`)
    ).toBeVisible();
    const sectionDates = await page
      .getByTestId(/^archive-date-time-\d{4}-\d{2}-\d{2}$/)
      .evaluateAll(
        (times, month) =>
          times
            .map((time) => time.getAttribute('datetime'))
            .filter((date) => date?.startsWith(month)),
        monthKey
      );
    expect(sectionDates.every((date) => date?.startsWith(monthKey ?? ''))).toBe(
      true
    );
  }

  const dateRows = page.getByTestId(/^archive-date-\d{4}-\d{2}-\d{2}$/);
  const datetimes = await page
    .getByTestId(/^archive-date-time-\d{4}-\d{2}-\d{2}$/)
    .evaluateAll((times) => times.map((time) => time.getAttribute('datetime')));
  expect(datetimes).toEqual([...datetimes].sort().reverse());
  expect(await dateRows.count()).toBe(datetimes.length);

  const knownDate = page.getByTestId('archive-date-2026-10-24');
  await expect(knownDate).toBeVisible();
  const knownEntry = page.getByTestId(
    'archive-entry-link-entif.essay.agentic-aberrancy-atlas.01'
  );
  await expect(knownEntry).toHaveText('What Happened to Us');
  await expect(knownEntry).toHaveAttribute(
    'href',
    '/articles/agentic-aberrancy-atlas/01-what-happened-to-us/'
  );
});

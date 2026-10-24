import { expect, test } from '@playwright/test';

const route = '/articles/agentic-aberrancy-atlas/01-what-happened-to-us/';
const chapterTitles = [
  'What Happened to Us',
  'The Pattern Hidden Inside 296 Reports',
  'Memory Without Continuity',
  'Reasoning That Becomes Theater',
  'The System That Knows Better and Does It Anyway',
  'When the Control Plane Starts Failing',
  'Broken Mirrors',
  'The Failure Factory',
  'The User Becomes the Missing Runtime',
  'Other Users Started Reporting the Same Weather',
  'What I Think Is Happening',
  'Plausible Failure Is the Dangerous Kind',
  'The Authority Gap',
  'The Security Footnote From Hell',
  'Where This Trajectory Leads',
] as const;

test('Articles index exposes every Atlas chapter except references', async ({
  page,
}) => {
  await page.goto('/articles/');

  for (const [index, title] of chapterTitles.entries()) {
    const order = String(index + 1).padStart(2, '0');
    const card = page.locator(
      `[data-test-id="content-card-entif.essay.agentic-aberrancy-atlas.${order}"]`
    );
    await expect(card).toBeVisible();
    await expect(card.locator('h2')).toHaveText(title);
  }

  await expect(page.locator('.card-grid')).not.toContainText(
    'Appendices & References'
  );
});

test('Atlas uses the shared site shell and starts in text-only mode', async ({
  page,
}) => {
  await page.goto(route);

  await expect(page.getByTestId('site-header')).toBeVisible();
  await expect(page.getByTestId('site-footer')).toBeVisible();
  await expect(page.getByTestId('atlas-root')).toHaveAttribute(
    'data-atlas-view',
    'text'
  );
  await expect(page.locator('.atlas-source h1')).toContainText(
    /An Agentic\s*Aberrancy\s*Atlas Shrugged/
  );
  await expect(
    page.locator('.atlas-source .article-copy').first()
  ).toBeVisible();
  await expect(page.locator('.atlas-source .art-stage').first()).toBeHidden();
  await expect(page.locator('[data-atlas-scene-jumper]')).toBeHidden();
  await expect(page.getByTestId('atlas-chapter-rail')).toBeHidden();
  await expect(page.locator('main')).not.toContainText('Migration status');
  await expect(page.locator('main')).not.toContainText(
    'illustrated scenes ported'
  );
  await expect(page.locator('main')).not.toContainText('Semi-final');
  await expect(page.locator('main')).not.toContainText('Prepared for Crates');
});

test('every published Atlas chapter route resolves', async ({ page }) => {
  await page.goto('/articles/');
  const links = page.locator(
    '[data-test-id^="content-card-entif.essay.agentic-aberrancy-atlas."] h2 a'
  );
  await expect(links).toHaveCount(15);

  for (const link of await links.all()) {
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^\/articles\/agentic-aberrancy-atlas\//);
    expect((await page.request.get(href ?? '')).status()).toBe(200);
  }
});

test('visualization is an explicit progressive enhancement', async ({
  page,
}) => {
  await page.goto(route);

  const toggle = page.getByTestId('atlas-view-toggle');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveText('Visualize');
  await toggle.click();

  await expect(page.getByTestId('atlas-root')).toHaveAttribute(
    'data-atlas-view',
    'visual'
  );
  await expect(toggle).toHaveText('Text only');
  await expect(page.locator('.atlas-source .art-stage').first()).toBeVisible();
  await expect(page.getByTestId('atlas-motion-toggle')).toBeVisible();
  const rail = page.getByTestId('atlas-chapter-rail');
  await expect(rail).toBeVisible();
  await expect(rail.locator('a')).toHaveCount(15);
  await expect(rail.locator('a[aria-current="page"]')).toHaveAttribute(
    'aria-label',
    'Chapter 1: What Happened to Us'
  );
});

test('chapter rail navigates among Atlas chapters', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  await page.getByTestId('atlas-view-toggle').click();

  const secondChapter = page
    .getByTestId('atlas-chapter-rail')
    .locator('a')
    .nth(1);
  await expect(secondChapter).toHaveAttribute(
    'aria-label',
    'Chapter 2: The Pattern Hidden Inside 296 Reports'
  );
  await secondChapter.click();
  await expect(page).toHaveURL(
    /\/articles\/agentic-aberrancy-atlas\/02-the-pattern-hidden-inside-296-reports\/$/
  );
});

test('text-only mode remains the complete no-JavaScript fallback', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322' + route);

  await expect(page.getByTestId('atlas-root')).toHaveAttribute(
    'data-atlas-view',
    'text'
  );
  await expect(
    page.locator('.atlas-source .article-copy').first()
  ).toBeVisible();
  await expect(page.locator('.atlas-source .art-stage').first()).toBeHidden();
  await expect(page.getByTestId('atlas-view-toggle')).toBeHidden();

  await context.close();
});

test('reduced-motion preference keeps visualization static', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(route);
  await page.getByTestId('atlas-view-toggle').click();

  await expect(page.getByTestId('atlas-root')).toHaveAttribute(
    'data-atlas-motion',
    'reduced'
  );
  await expect(page.getByTestId('atlas-motion-toggle')).toHaveText(
    'Motion: off'
  );
});

for (const width of [390, 1440]) {
  test(`Atlas does not create document overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth
      )
    ).toBe(true);
  });
}

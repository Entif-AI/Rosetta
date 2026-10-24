import { expect, test } from '@playwright/test';

const route = '/articles/agentic-aberrancy-atlas/01-what-happened-to-us/';
const citationRoute =
  '/articles/agentic-aberrancy-atlas/03-memory-without-continuity/';
const referencesRoute =
  '/articles/agentic-aberrancy-atlas/16-appendices-and-references/';
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

  const descriptions: string[] = [];
  const tagSets: string[] = [];

  for (const [index, title] of chapterTitles.entries()) {
    const order = String(index + 1).padStart(2, '0');
    const card = page.locator(
      `[data-test-id="content-card-entif.essay.agentic-aberrancy-atlas.${order}"]`
    );
    await expect(card).toBeVisible();
    await expect(card.locator('h2')).toHaveText(title);
    descriptions.push(
      (await card.locator('.content-card-description').textContent())?.trim() ??
        ''
    );
    tagSets.push(
      (await card.locator('.tag-list').textContent())
        ?.replace(/\s+/g, ' ')
        .trim() ?? ''
    );
  }

  expect(new Set(descriptions).size).toBe(chapterTitles.length);
  expect(new Set(tagSets).size).toBe(chapterTitles.length);
  expect(descriptions).not.toContain(
    'Follow the incidents, the machinery, and the human work holding the relationships together.'
  );

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
  const rail = page.getByTestId('atlas-chapter-rail');
  await expect(rail).toBeVisible();
  await expect(rail.locator('a')).toHaveCount(16);
  await expect(rail.locator('a[aria-current="page"]')).toHaveAttribute(
    'aria-label',
    'Chapter 1: What Happened to Us'
  );
  await expect(page.locator('main')).not.toContainText('Migration status');
  await expect(page.locator('main')).not.toContainText(
    'illustrated scenes ported'
  );
  await expect(page.locator('main')).not.toContainText('Semi-final');
  await expect(page.locator('main')).not.toContainText('Prepared for Crates');
  await expect(page.locator('main')).not.toContainText('frozen Failure Atlas');
  await expect(page.locator('main')).not.toContainText('frozen Atlas');
});

test('every Atlas chapter listed on the Articles index resolves', async ({
  page,
}) => {
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
  await expect(rail.locator('a')).toHaveCount(16);
  await expect(rail.locator('a[aria-current="page"]')).toHaveAttribute(
    'aria-label',
    'Chapter 1: What Happened to Us'
  );
});

test('chapter rail navigates among Atlas chapters', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);

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

test('References exists as Chapter 16 but stays off the Articles index', async ({
  page,
}) => {
  await page.goto('/articles/');
  await expect(
    page.locator(
      '[data-test-id="content-card-entif.essay.agentic-aberrancy-atlas.16"]'
    )
  ).toHaveCount(0);

  await page.goto(
    '/articles/agentic-aberrancy-atlas/15-where-this-trajectory-leads/'
  );
  const next = page.locator('.atlas-ending a').filter({
    hasText: 'Appendices & References',
  });
  await expect(next).toBeVisible();
  await expect(next).toHaveAttribute('href', referencesRoute);

  await next.click();
  await expect(page).toHaveURL(
    /\/articles\/agentic-aberrancy-atlas\/16-appendices-and-references\/$/
  );
  await expect(page.locator('.atlas-source h1')).toHaveText(
    'Appendices & References'
  );
  const rail = page.getByTestId('atlas-chapter-rail');
  await expect(rail.locator('a')).toHaveCount(16);
  await expect(rail.locator('a[aria-current="page"]')).toHaveAttribute(
    'aria-label',
    'Chapter 16: Appendices & References'
  );
});

test('Atlas citations preview on hover and focus, then navigate to the exact reference anchor', async ({
  page,
}) => {
  await page.goto(citationRoute);

  const trigger = page.locator(
    '[data-test-id="citation-trigger"][data-citation-keys="C03,B:M045,B:M049,B:M047"]'
  );
  const citation = trigger.locator('xpath=..');
  const panel = citation.getByTestId('citation-panel');

  await trigger.hover();
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('C03');
  await expect(panel).toContainText('Failure Atlas deep case');

  await page.mouse.move(0, 0);
  await expect(panel).not.toBeVisible();
  await trigger.focus();
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  const reference = panel.locator(
    `[data-test-id="citation-reference"][href="${referencesRoute}#atlas-source-c03"]`
  );
  await expect(reference).toHaveAttribute(
    'href',
    `${referencesRoute}#atlas-source-c03`
  );
  await reference.click();
  await expect(page).toHaveURL(
    new RegExp(`${referencesRoute}#atlas-source-c03$`)
  );
  await expect(page.locator('#atlas-source-c03')).toHaveCount(1);
  await expect(page.locator('#atlas-source-c03')).toHaveCSS(
    'scroll-margin-top',
    /.+/
  );
});

test('Atlas citation disclosure works by touch without forcing navigation', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322' + citationRoute);

  const citation = page.getByTestId('editorial-citation').filter({
    hasText: 'B:M045',
  });
  await citation.getByTestId('citation-trigger').tap();
  const panel = citation.getByTestId('citation-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Bilqis Mistakes ledger record');
  await expect(panel.getByTestId('citation-reference').first()).toHaveAttribute(
    'href',
    new RegExp(`^${referencesRoute}#atlas-source-`)
  );
  await panel.getByTestId('citation-close').tap();
  await expect(panel).not.toBeVisible();
  await context.close();
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
  await expect(page.getByTestId('atlas-chapter-rail')).toBeVisible();
  await expect(page.getByTestId('atlas-chapter-rail').locator('a')).toHaveCount(
    16
  );
  await expect(page.getByTestId('citation-fallback').first()).toBeVisible();
  await expect(page.getByTestId('citation-trigger').first()).toBeHidden();

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

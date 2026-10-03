import { readdirSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
const reports = [
  '/tags/research/2026/09/06/the-cost-of-learning-too-late/',
  '/tags/research/2026/09/07/after-the-inflection/',
];
const paths = readdirSync('dist', { recursive: true })
  .filter((p): p is string => typeof p === 'string' && p.endsWith('.html'))
  .map((p) => '/' + p);

test('navigation, social destinations, and card keyboard disclosure', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-test-id="site-skip-link"]')).toBeFocused();
  for (const [key, path] of [
    ['research', '/research/'],
    ['articles', '/articles/'],
    ['projects', '/projects/'],
    ['about', '/about/'],
    ['contact', '/contact/'],
  ] as const)
    await expect(
      page.locator(`[data-test-id="site-nav-${key}"]`)
    ).toHaveAttribute('href', path);
  const social = page.locator('.social-links a');
  await expect(social).toHaveCount(3);
  for (const link of await social.all()) {
    const box = await link.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  const summaries = page.locator('.claim-card summary');
  await summaries.nth(2).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.claim-card').nth(2)).toHaveAttribute('open', '');
  await summaries.nth(0).click();
  await expect(page.locator('.claim-card[open]')).toHaveCount(1);
  await expect(summaries.nth(0)).toBeFocused();
});

test('published manuscripts retain scientific status and working figures', async ({
  page,
}) => {
  for (const route of reports) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.article-aside')).toContainText(
      'independent external review pending'
    );
    await expect(page.locator('.article-body')).toContainText('Abstract');
    await expect(page.locator('.article-body')).toContainText('References');
    for (const img of await page.locator('.article-body img').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveJSProperty('complete', true);
      expect(
        await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      ).toBeGreaterThan(0);
    }
    const download = page.locator('a[download]');
    expect(
      (
        await page.request.get((await download.getAttribute('href')) ?? '')
      ).status()
    ).toBe(200);
  }
});

test('IndraNet publication shell owns the title and all figures render', async ({
  page,
}) => {
  await page.goto('/tags/research/2026/09/28/indranet-research/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(
    page.locator('[data-test-id="published-entry-heading"]')
  ).toHaveText(
    'IndraNet: Vectorized Meat-Space for Spatial Twins and Embodied AI Governance'
  );
  await expect(
    page.locator('[data-test-id="published-entry-body"] h1')
  ).toHaveCount(0);
  await expect(page.locator('.article-body')).toContainText('Abstract');
  await expect(page.locator('.article-body')).toContainText('References');

  const figures = page.locator('.article-body img');
  await expect(figures).toHaveCount(20);
  for (const img of await figures.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveJSProperty('complete', true);
    expect(
      await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
    ).toBeGreaterThan(0);
    await expect(img).toHaveAttribute(
      'src',
      /^\/research-assets\/indranet\/graphics\/F\d{2}\.svg$/
    );
  }
});

test('old URLs and date archives remain available; drafts stay private', async ({
  page,
}) => {
  for (const path of [
    '/tags/rosetta/2026/08/28/agentic-memory/',
    '/tags/rosetta/',
    '/team/',
    '/projects/',
    '/archive/2026/',
    '/archive/2026/09/',
    '/archive/2026/09/07/',
  ])
    expect((await page.goto(path))?.status()).toBe(200);
  expect(
    (
      await page.goto('/tags/rosetta/2026/08/28/editorial-pipeline-draft/')
    )?.status()
  ).toBe(404);
});

const reflowRoutes = [
  ['/', 'home-hero-heading'],
  ...reports.map((path) => [path, 'published-entry-heading'] as const),
  ['/about/', 'content-page-heading'],
] as const;

for (const [width, height] of [
  [320, 568],
  [390, 844],
  [768, 1024],
  [844, 390],
  [1024, 768],
  [1366, 768],
  [1536, 1024],
]) {
  test(`reflows at ${width}×${height} with bounded display typography`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: width ?? 390, height: height ?? 800 });
    for (const [path, headingTestId] of reflowRoutes) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth
        )
      ).toBe(true);

      const heading = page.locator(`[data-test-id="${headingTestId}"]`);
      await expect(heading).toBeVisible();
      const typography = await heading.evaluate((element) => {
        const style = getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize);
        return {
          fontSize,
          lineHeightRatio: parseFloat(style.lineHeight) / fontSize,
        };
      });
      expect(typography.fontSize).toBeGreaterThanOrEqual(13);
      expect(typography.fontSize).toBeLessThanOrEqual(96);
      expect(typography.lineHeightRatio).toBeGreaterThanOrEqual(0.85);
      expect(typography.lineHeightRatio).toBeLessThanOrEqual(1.8);
    }
  });
}

test('200% text size and WCAG text spacing preserve reflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const path of ['/', ...reports]) {
    await page.goto(path);
    await page.addStyleTag({
      content:
        'html{font-size:200%!important} *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-bottom:2em!important}',
    });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth
      )
    ).toBe(true);
  }
});

test('native disclosure works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/');
  await page.locator('.claim-card summary').first().click();
  await expect(page.locator('.claim-receipt').first()).toBeVisible();
  await context.close();
});

test('reduced motion disables decorative animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page
    .locator('.claim-card')
    .nth(2)
    .evaluate((e) => e.classList.add('idle-cue'));
  expect(
    await page
      .locator('.claim-card summary')
      .nth(2)
      .evaluate((e) => getComputedStyle(e, '::after').animationName)
  ).toBe('none');
});

for (const path of paths)
  test(`WCAG 2.2 AA automated audit: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags([
        'wcag2a',
        'wcag2aa',
        'wcag21a',
        'wcag21aa',
        'wcag22aa',
        'best-practice',
      ])
      .analyze();
    expect(results.violations).toEqual([]);
  });

test('touch cue occurs once and prior card interaction cancels it', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 768, height: 1400 },
  });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto('http://127.0.0.1:4322/');
  await page.clock.runFor(10001);
  await expect(page.locator('.idle-cue')).toHaveCount(1);
  await page.clock.runFor(1500);
  await expect(page.locator('.idle-cue')).toHaveCount(0);
  await page.clock.runFor(20000);
  await expect(page.locator('.idle-cue')).toHaveCount(0);
  await page.reload();
  await page.locator('.claim-card summary').first().click();
  await page.clock.runFor(11000);
  await expect(page.locator('.idle-cue')).toHaveCount(0);
  await context.close();
});

test('cards retain their geometry and hero position when opened', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const cards = page.locator('.claim-card');
  const hero = await page.locator('.hero-copy').boundingBox();
  for (const card of await cards.all()) {
    const before = await card.boundingBox();
    await card.locator('summary').click();
    expect((await card.boundingBox())?.height).toBe(before?.height);
    expect((await page.locator('.hero-copy').boundingBox())?.y).toBe(hero?.y);
  }
});
test('tag date archives and scroll to top work', async ({ page }) => {
  for (const date of ['2026', '2026/09', '2026/09/07']) {
    expect((await page.goto(`/tags/research/${date}/`))?.status()).toBe(200);
    await expect(page.locator('main')).toContainText('After the Inflection');
  }
  await page.goto(reports[0] ?? '/');
  await page.evaluate(() => window.scrollTo(0, innerHeight * 2));
  const top = page.locator('[data-test-id="scroll-top"]');
  await expect(top).toBeVisible();
  await top.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(top).not.toBeVisible();
});

test('404 document and direct 404 route retain working site navigation', async ({
  page,
}) => {
  for (const path of ['/404.html', '/404/', '/this-page-does-not-exist/']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(
      path.includes('does-not-exist') ? 404 : 200
    );
    await expect(page.locator('.not-found h1')).toBeVisible();
    await expect(page.locator('.not-found .button')).toHaveAttribute(
      'href',
      '/'
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    );
  }
});

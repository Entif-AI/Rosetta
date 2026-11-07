import { readdirSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
const reports = [
  '/tags/research/2026/09/06/the-cost-of-learning-too-late/',
  '/tags/research/2026/09/07/after-the-inflection/',
];
const claimKeys = [
  'source',
  'observation',
  'interpretation',
  'projection',
] as const;
const socialTestIds = [
  'site-social-youtube',
  'site-social-x',
  'site-social-github',
] as const;
const paths = readdirSync('dist', { recursive: true })
  .filter((p): p is string => typeof p === 'string' && p.endsWith('.html'))
  .map((p) => '/' + p);

async function expectUniqueTestIds(page: Page) {
  const ids = await page
    .getByTestId(/.+/)
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-test-id'))
    );
  expect(ids).not.toContain(null);
  expect(new Set(ids).size).toBe(ids.length);
}

async function idleCueCount(page: Page) {
  return page
    .getByTestId(/^claim-card-/)
    .evaluateAll(
      (cards) =>
        cards.filter((card) => card.classList.contains('idle-cue')).length
    );
}

test('navigation, social destinations, and card keyboard disclosure', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('site-skip-link')).toBeFocused();
  for (const [key, path] of [
    ['research', '/research/'],
    ['articles', '/articles/'],
    ['projects', '/projects/'],
    ['about', '/about/'],
    ['contact', '/contact/'],
  ] as const)
    await expect(page.getByTestId(`site-nav-${key}`)).toHaveAttribute(
      'href',
      path
    );
  await expect(
    page.getByTestId(/^site-social-(?:youtube|x|github)$/)
  ).toHaveCount(3);
  for (const testId of socialTestIds) {
    const box = await page.getByTestId(testId).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  const interpretationSummary = page.getByTestId(
    'claim-summary-interpretation'
  );
  await interpretationSummary.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('claim-card-interpretation')).toHaveAttribute(
    'open',
    ''
  );
  const sourceSummary = page.getByTestId('claim-summary-source');
  await sourceSummary.click();
  await expect
    .poll(() =>
      page
        .getByTestId(/^claim-card-/)
        .evaluateAll(
          (cards) => cards.filter((card) => card.hasAttribute('open')).length
        )
    )
    .toBe(1);
  await expect(sourceSummary).toBeFocused();
});

test('homepage hero links and claim disclosures are legible without a disclaimer banner', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('home-hero-research')).toHaveAttribute(
    'href',
    '/research/'
  );
  await expect(page.getByTestId('home-hero-research')).toContainText(
    'Explore research'
  );
  await expect(page.getByTestId('home-hero-about')).toHaveAttribute(
    'href',
    '/about/'
  );
  await expect(page.getByTestId('home-hero-about')).toContainText(
    'About Entif'
  );
  await expect(page.getByTestId('entif-home')).not.toContainText(
    'Traceability is not proof of truth'
  );

  expect(
    await page.getByTestId('home-hero-aside').evaluate((aside) => {
      const rootSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      return parseFloat(getComputedStyle(aside).fontSize) / rootSize;
    })
  ).toBeCloseTo(1.45, 2);

  const card = page.getByTestId('claim-card-interpretation');
  await page.getByTestId('claim-summary-interpretation').click();
  await expect(card).toHaveAttribute('open', '');
  await expect(page.getByTestId('claim-text-interpretation')).toBeVisible();
  const cardBox = await card.boundingBox();
  const receiptBox = await page
    .getByTestId('claim-receipt-interpretation')
    .boundingBox();
  expect(cardBox).not.toBeNull();
  expect(receiptBox).not.toBeNull();
  expect((receiptBox?.y ?? -1) >= (cardBox?.y ?? 0)).toBe(true);
  expect(
    (receiptBox?.y ?? 0) + (receiptBox?.height ?? 0) <=
      (cardBox?.y ?? 0) + (cardBox?.height ?? 0) + 1
  ).toBe(true);
});

test('homepage text inherits the site typeface and never falls below 1rem', async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('/');
    await page.getByTestId('claim-summary-interpretation').click();

    const outliers = await page.getByTestId(/.+/).evaluateAll((elements) => {
      const rootStyle = getComputedStyle(document.documentElement);
      const minimumSize = parseFloat(rootStyle.fontSize);
      const siteTypeface = rootStyle.fontFamily;
      const failures: string[] = [];
      for (const element of elements) {
        if (!element.textContent?.trim() || !element.getClientRects().length)
          continue;
        const style = getComputedStyle(element);
        if (style.visibility === 'hidden' || style.display === 'none') continue;
        if (
          parseFloat(style.fontSize) + 0.01 < minimumSize ||
          style.fontFamily !== siteTypeface
        ) {
          failures.push(
            `${element.getAttribute('data-test-id')}: ${style.fontSize}; ${
              style.fontFamily
            }`
          );
        }
      }
      return failures;
    });
    expect(outliers).toEqual([]);
  }
});

test('portrait header groups logo and socials above an unbroken tagline and navigation', async ({
  page,
}) => {
  for (const width of [320, 350, 360, 390, 708, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const bounds = async (testId: string) => {
      const box = await page.getByTestId(testId).boundingBox();
      if (!box) throw new Error(`Missing visible geometry for ${testId}`);
      return { ...box, bottom: box.y + box.height };
    };
    const [viewport, scrollWidth] = await page.evaluate(() => [
      document.documentElement.clientWidth,
      document.documentElement.scrollWidth,
    ]);
    const logo = await bounds('site-brand-logo');
    const tagline = await bounds('site-brand-tagline');
    const taglineLineHeight = await page
      .getByTestId('site-brand-tagline')
      .evaluate((element) => parseFloat(getComputedStyle(element).lineHeight));
    const navTestIds = [
      'site-nav-research',
      'site-nav-articles',
      'site-nav-projects',
      'site-nav-about',
      'site-nav-contact',
    ];
    const navRows = await Promise.all(
      navTestIds.map(async (testId) => Math.round((await bounds(testId)).y))
    );
    const navFont = await page
      .getByTestId('site-nav-research')
      .evaluate((element) => getComputedStyle(element).fontVariantCaps);
    const navFontSize = await page
      .getByTestId('site-nav-research')
      .evaluate((element) => getComputedStyle(element).fontSize);
    const socialButtons = await Promise.all(socialTestIds.map(bounds));
    const actionArea = await bounds('home-hero-actions');
    const rootSize = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
    const actions = await Promise.all(
      ['home-hero-research', 'home-hero-about'].map(async (testId) => {
        const box = await bounds(testId);
        const fontSize = await page
          .getByTestId(testId)
          .evaluate((element) =>
            parseFloat(getComputedStyle(element).fontSize)
          );
        return { ...box, remSize: fontSize / rootSize };
      })
    );
    const geometry = {
      viewport,
      scrollWidth,
      logo,
      tagline,
      taglineLines: tagline.height / taglineLineHeight,
      navRows,
      navFont,
      navFontSize,
      socialButtons,
      actionArea,
      actions,
    };

    expect(geometry.scrollWidth).toBe(geometry.viewport);
    expect(geometry.tagline.y).toBeGreaterThan(geometry.logo.bottom);
    expect(Math.min(...geometry.navRows)).toBeGreaterThan(
      geometry.tagline.bottom
    );
    expect(geometry.navFont).toBe('all-small-caps');
    expect(geometry.navFontSize).toBe('17px');
    expect(geometry.socialButtons).toHaveLength(3);
    for (const icon of geometry.socialButtons) {
      expect(icon.y).toBeCloseTo(geometry.logo.y, 0);
      expect(icon.width).toBeCloseTo(geometry.logo.width, 0);
      expect(icon.height).toBeCloseTo(geometry.logo.height, 0);
    }
    if (width <= 350) {
      expect(geometry.navRows.slice(0, 3)).toEqual([
        geometry.navRows[0],
        geometry.navRows[0],
        geometry.navRows[0],
      ]);
      expect(geometry.navRows[3]).toBe(geometry.navRows[4]);
      expect(geometry.navRows[3]).toBeGreaterThan(geometry.navRows[0] ?? -1);
    } else {
      expect(new Set(geometry.navRows).size).toBe(1);
      expect(geometry.taglineLines).toBeCloseTo(1, 0);
    }
    for (const button of geometry.actions) {
      expect(button.width).toBeCloseTo(geometry.actionArea.width, 0);
      expect(button.height).toBeGreaterThanOrEqual(68);
      expect(button.remSize).toBeGreaterThanOrEqual(1.25);
    }
  }
});

test('desktop header and hero actions retain their inline layout', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const logo = await page.getByTestId('site-brand-logo').boundingBox();
  const tagline = await page.getByTestId('site-brand-tagline').boundingBox();
  const research = await page.getByTestId('home-hero-research').boundingBox();
  const about = await page.getByTestId('home-hero-about').boundingBox();
  expect(tagline?.x).toBeGreaterThan((logo?.x ?? 0) + (logo?.width ?? 0));
  expect(research?.y).toBeCloseTo(about?.y ?? -1, 0);
  expect((research?.width ?? 0) + (about?.width ?? 0)).toBeLessThan(800);
});

test('published manuscripts retain scientific status and working figures', async ({
  page,
}) => {
  for (const route of reports) {
    await page.goto(route);
    await expect(page.getByTestId('published-entry-heading')).toHaveCount(1);
    await expect(page.getByTestId('published-entry-metadata')).toContainText(
      'independent external review pending'
    );
    const body = page.getByTestId('published-entry-body');
    await expect(body).toContainText('Abstract');
    await expect(body).toContainText('References');
    expect(
      await body.evaluate(
        (element) => element.innerHTML.match(/<h1(?:\s|>)/gi)?.length ?? 0
      )
    ).toBe(0);
    for (const img of await page
      .getByTestId(/^published-entry-figure-/)
      .all()) {
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveJSProperty('complete', true);
      expect(
        await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      ).toBeGreaterThan(0);
    }
    const download = page.getByTestId('published-entry-download');
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
  await page.goto('/tags/research/2026/10/04/indranet-research/');
  const title =
    'IndraNet: Vectorized Meat-Space for Spatial Twins and Embodied AI Governance';
  await expect(page.getByTestId('published-entry-heading')).toHaveText(title);
  const body = page.getByTestId('published-entry-body');
  expect(
    await body.evaluate(
      (element) => element.innerHTML.match(/<h1(?:\s|>)/gi)?.length ?? 0
    )
  ).toBe(0);
  await expect(body).toContainText('Abstract');
  await expect(body).toContainText('References');

  const figures = page.getByTestId(/^published-entry-figure-/);
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
  ['/projects/', 'uca-hero-heading'],
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

      const heading = page.getByTestId(headingTestId);
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
  await page.getByTestId('claim-summary-source').click();
  await expect(page.getByTestId('claim-receipt-source')).toBeVisible();
  await context.close();
});

test('reduced motion disables decorative animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page
    .getByTestId('claim-card-interpretation')
    .evaluate((element) => element.classList.add('idle-cue'));
  expect(
    await page
      .getByTestId('claim-summary-interpretation')
      .evaluate((element) => getComputedStyle(element, '::after').animationName)
  ).toBe('none');
});

for (const path of paths)
  test(`WCAG 2.2 AA automated audit: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expectUniqueTestIds(page);
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
  expect(await idleCueCount(page)).toBe(1);
  await page.clock.runFor(1500);
  expect(await idleCueCount(page)).toBe(0);
  await page.clock.runFor(20000);
  expect(await idleCueCount(page)).toBe(0);
  await page.reload();
  await page.getByTestId('claim-summary-source').click();
  await page.clock.runFor(11000);
  expect(await idleCueCount(page)).toBe(0);
  await context.close();
});

test('cards retain their geometry and hero position when opened', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const hero = await page.getByTestId('home-hero-heading').boundingBox();
  for (const key of claimKeys) {
    const card = page.getByTestId(`claim-card-${key}`);
    const before = await card.boundingBox();
    await page.getByTestId(`claim-summary-${key}`).click();
    expect((await card.boundingBox())?.height).toBe(before?.height);
    expect((await page.getByTestId('home-hero-heading').boundingBox())?.y).toBe(
      hero?.y
    );
  }
});
test('tag date archives and scroll to top work', async ({ page }) => {
  for (const date of ['2026', '2026/09', '2026/09/07']) {
    expect((await page.goto(`/tags/research/${date}/`))?.status()).toBe(200);
    await expect(
      page.getByTestId(`tag-date-grid-research-${date.replaceAll('/', '-')}`)
    ).toContainText('After the Inflection');
  }
  await page.goto(reports[0] ?? '/');
  await page.evaluate(() => window.scrollTo(0, innerHeight * 2));
  const top = page.getByTestId('scroll-top');
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
    await expect(page.getByTestId('not-found-heading')).toBeVisible();
    await expect(page.getByTestId('not-found-home')).toHaveAttribute(
      'href',
      '/'
    );
    await expect(page.getByTestId('site-robots')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    );
  }
});

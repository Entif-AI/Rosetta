import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const corpus = JSON.parse(
  readFileSync('evidence/about/content-sources.json', 'utf8')
) as { documents: { id: string; slug: string }[] };
const ids = Array.from(
  { length: 14 },
  (_, i) => `D${String(i + 1).padStart(2, '0')}`
).concat('D16');
const route = (slug: string) => `/about/doctrine/${slug}/`;

test('print includes the closed biography and complete doctrine while suppressing decorative artwork', async ({
  page,
}) => {
  await page.emulateMedia({ media: 'print' });
  await page.goto('/about/');
  await expect(page.getByTestId('about-bio')).not.toHaveAttribute('open');
  await expect(page.getByTestId('about-bio-prose')).toBeVisible();
  await expect(page.getByTestId('content-page-heading')).toHaveCSS(
    'color',
    'rgb(0, 0, 0)'
  );
  await expect(page.getByTestId('about-hero-image')).toBeHidden();
  await page.goto(route('governance-criteria'));
  await expect(page.getByTestId('doctrine-body')).toContainText('GC001:');
  await expect(page.getByTestId('doctrine-body')).toContainText('GC052:');
  await expect(page.getByTestId('doctrine-contents')).toBeHidden();
});

test('About leads into the complete doctrine suite with unique working heroes', async ({
  page,
}) => {
  await page.goto('/about/');
  await expect(page.getByTestId('content-page-heading')).toHaveCount(1);
  for (const stage of [
    'about-hero',
    'about-mission',
    'about-principles',
    'about-founder',
    'doctrine-library',
    'about-closing',
  ])
    await expect(page.getByTestId(stage)).toBeVisible();
  const cards = page.getByTestId(/^doctrine-card-/);
  await expect(cards).toHaveCount(15);
  expect(
    await cards.evaluateAll((elements) =>
      elements.map((e) =>
        e.getAttribute('data-test-id')?.replace('doctrine-card-', '')
      )
    )
  ).toEqual(ids);
  await expect(page.getByTestId('doctrine-card-D15')).toHaveCount(0);
  const heroes = new Set<string>();
  for (const [i, doc] of corpus.documents.entries()) {
    await page.goto('/about/#doctrine');
    await page.getByTestId(`doctrine-card-${doc.id}`).click();
    await expect(page).toHaveURL(new RegExp(`${route(doc.slug)}$`));
    await expect(page.getByTestId('doctrine-heading')).toBeVisible();
    await expect(page.getByTestId('doctrine-metadata')).toContainText(
      `${doc.id} · v0.1.0`
    );
    const hero = page.getByTestId('about-hero-image');
    await expect(hero).toHaveJSProperty('complete', true);
    expect(
      await hero.evaluate((el: HTMLImageElement) => el.naturalWidth)
    ).toBeGreaterThan(0);
    await expect(hero).toHaveAttribute('srcset', /640w.*960w.*1280w.*1672w/);
    heroes.add((await hero.getAttribute('src')) ?? '');
    const contents = page.getByTestId('doctrine-contents');
    const fragments = await page
      .getByTestId(/^doctrine-contents-link-/)
      .evaluateAll((elements) =>
        elements.map((e) => e.getAttribute('href')?.slice(1))
      );
    expect(fragments.length).toBeGreaterThan(0);
    const expected = [corpus.documents[i - 1], corpus.documents[i + 1]]
      .filter((entry) => entry !== undefined)
      .map((entry) => route(entry.slug));
    const neighborHrefs = await Promise.all(
      [
        page.getByTestId('doctrine-neighbor-previous'),
        page.getByTestId('doctrine-neighbor-next'),
      ].map(async (neighbor) =>
        (await neighbor.count()) ? neighbor.getAttribute('href') : null
      )
    );
    expect(neighborHrefs.filter(Boolean)).toEqual(expected);
    await expect(page.getByTestId('doctrine-breadcrumb-about')).toHaveAttribute(
      'href',
      '/about/'
    );
    await expect(contents).toBeVisible();
  }
  expect(heroes.size).toBe(15);
});

test('native source dates, all 52 criteria and honest publication states survive rendering', async ({
  page,
}) => {
  await page.goto(route('why-nonprofit'));
  const body = page.getByTestId('doctrine-body');
  for (const date of ['Oct 1, 2026', 'Apr 29, 2025', 'Oct 2, 2026'])
    await expect(body).toContainText(date);
  await page.goto(route('governance-criteria'));
  const criteriaText = await page.getByTestId('doctrine-body').innerText();
  expect(criteriaText.match(/GC\d{3}:/g)).toHaveLength(52);
  for (const number of [1, 26, 52])
    await expect(page.getByTestId('doctrine-body')).toContainText(
      `GC${String(number).padStart(3, '0')}:`
    );
  await expect(page.getByTestId('doctrine-source-note')).toContainText(
    'Astra Pass 1'
  );
  await expect(page.getByTestId('doctrine-status')).toContainText('candidate');
  await page.goto(route('legal-design'));
  await expect(page.getByTestId('doctrine-status')).toContainText(
    'public overview'
  );
  await expect(page.getByTestId('doctrine-body')).toContainText(
    'internal preparatory document'
  );
  await expect(page.getByTestId('doctrine-body')).toContainText(
    'What remains to be established'
  );
});

test('full biography, contents and reading navigation work with JavaScript disabled', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/about/');
  const bio = page.getByTestId('about-bio');
  await page.getByTestId('about-bio-summary').focus();
  await page.keyboard.press('Enter');
  await expect(bio).toHaveAttribute('open', '');
  await expect(bio).toContainText('Engineering experience behind Entif AI');
  await page.getByTestId('doctrine-card-D11').click();
  await page
    .getByTestId(
      'doctrine-contents-link-1-intelligence-does-not-appoint-itself-an-authority'
    )
    .click();
  await expect(page).toHaveURL(/#.+$/);
  await expect(page.getByTestId('doctrine-body')).toBeVisible();
  await page.getByTestId('doctrine-back').click();
  await expect(page).toHaveURL(/\/about\/#doctrine$/);
  await context.close();
});

for (const doc of corpus.documents) {
  test(`${doc.id} reflows with enlarged spaced text and passes a phone accessibility audit`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(route(doc.slug));
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
    await expect(page.getByTestId('doctrine-heading')).toBeVisible();
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
}

test('About keeps its library, biography and focus usable under enlarged text and forced colors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/about/');
  await page.addStyleTag({ content: 'html{font-size:200%!important}' });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    )
  ).toBe(true);
  await page.getByTestId('about-bio-summary').click();
  await expect(page.getByTestId('about-bio')).toHaveAttribute('open', '');
  await page.getByTestId('doctrine-card-D16').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`${route('governance-criteria')}$`));
});

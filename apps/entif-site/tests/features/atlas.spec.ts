import { expect, test } from '@playwright/test';

const route = '/articles/agentic-aberrancy-atlas/01-what-happened-to-us/';

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

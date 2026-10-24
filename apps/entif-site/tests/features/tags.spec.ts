import { expect, test } from '@playwright/test';

test('tag directory presents weighted human-readable labels without chip chrome or visible counts', async ({
  page,
}) => {
  await page.goto('/tags/');

  const cloud = page.locator('[data-test-id="tags-page-directory"]');
  const links = cloud.locator('[data-test-id="tag-cloud-link"]');
  expect(await links.count()).toBeGreaterThan(20);

  const agentic = cloud.locator('[data-tag="agentic-ai"]');
  await expect(agentic).toHaveText('agentic ai');
  await expect(agentic).toHaveAttribute('data-count', /^\d+$/);

  const labels = await links.allTextContents();
  expect(labels.every((label) => !label.includes('·'))).toBe(true);
  expect(labels.every((label) => !label.includes('-'))).toBe(true);

  const visualChrome = await agentic.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      textDecorationLine: style.textDecorationLine,
    };
  });
  expect(visualChrome.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(visualChrome.textDecorationLine).toBe('none');

  const strongest = cloud.locator('[data-tag="ai"]');
  const weakest = cloud.locator('[data-tag="codito"]');
  const [strongestVisual, weakestVisual] = await Promise.all([
    strongest.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        fontSize: parseFloat(style.fontSize),
        fontWeight: Number(style.fontWeight),
        weight: Number(element.getAttribute('data-weight')),
      };
    }),
    weakest.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        fontSize: parseFloat(style.fontSize),
        fontWeight: Number(style.fontWeight),
        weight: Number(element.getAttribute('data-weight')),
      };
    }),
  ]);
  expect(strongestVisual.weight).toBeGreaterThan(weakestVisual.weight);
  expect(strongestVisual.fontSize).toBeGreaterThan(weakestVisual.fontSize);
  expect(strongestVisual.fontWeight).toBeGreaterThan(weakestVisual.fontWeight);
});

test('tag cloud lays out responsively and gives hovered tags spatial focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/tags/');

  const cloud = page.locator('[data-test-id="tags-page-directory"]');
  await expect(cloud).toHaveAttribute('data-cloud-ready', 'true');

  const centerGravity = await cloud.evaluate((element) => {
    const cloudBox = element.getBoundingClientRect();
    const centerX = cloudBox.left + cloudBox.width / 2;
    const centerY = cloudBox.top + cloudBox.height / 2;
    const distanceFromCenter = (target: Element): number => {
      const box = target.getBoundingClientRect();
      return Math.hypot(
        box.left + box.width / 2 - centerX,
        box.top + box.height / 2 - centerY
      );
    };
    const strongest = element.querySelector('[data-tag="ai"]');
    const weakest = [...element.querySelectorAll('[data-weight="0.0000"]')];
    if (!strongest || weakest.length === 0)
      throw new Error('Missing weighted tag samples');
    return {
      strongest: distanceFromCenter(strongest),
      weakestAverage:
        weakest.reduce((sum, tag) => sum + distanceFromCenter(tag), 0) /
        weakest.length,
    };
  });
  expect(centerGravity.strongest).toBeLessThan(centerGravity.weakestAverage);

  const focused = cloud.locator('[data-tag="ai"]');
  const peer = cloud.locator('[data-tag="institutions"]').locator('xpath=..');
  const before = await peer.evaluate(
    (element) => getComputedStyle(element).transform
  );
  await focused.hover();
  await expect
    .poll(() => peer.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(before);

  await page.mouse.move(0, 0);
  const resizeProbe = cloud
    .locator('[data-tag="semantic-representation"]')
    .locator('xpath=..');
  const beforeResize = await resizeProbe.evaluate(
    (element) => getComputedStyle(element).transform
  );

  for (const [index, viewport] of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ].entries()) {
    await page.setViewportSize(viewport);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth
        )
      )
      .toBe(true);
    if (index === 0) {
      await expect
        .poll(() =>
          resizeProbe.evaluate((element) => getComputedStyle(element).transform)
        )
        .not.toBe(beforeResize);
    }
    const bounds = await cloud.boundingBox();
    expect(bounds?.width ?? Infinity).toBeLessThanOrEqual(viewport.width);
  }
});

test('tag cloud removes motion when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/tags/');
  const item = page
    .locator('[data-test-id="tags-page-directory"] [data-tag="ai"]')
    .locator('xpath=..');
  expect(
    await item.evaluate(
      (element) => getComputedStyle(element).transitionDuration
    )
  ).toBe('0s');
});

import { expect, test, type Page } from '@playwright/test';

interface TagHook {
  readonly id: string;
  readonly tagName: string;
  readonly tag: string | null;
  readonly count: string | null;
  readonly weight: number;
  readonly text: string;
}

interface TagBox extends TagHook {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const hooks = async (page: Page): Promise<TagHook[]> =>
  page.getByTestId(/^tag-cloud-/).evaluateAll((elements) =>
    elements.map((element) => ({
      id: element.getAttribute('data-test-id') ?? '',
      tagName: element.tagName,
      tag: element.getAttribute('data-tag'),
      count: element.getAttribute('data-count'),
      weight: Number(element.getAttribute('data-weight')),
      text: element.textContent?.trim() ?? '',
    }))
  );

const linkHooks = (items: readonly TagHook[]): TagHook[] =>
  items.filter((item) => item.tagName === 'A' && item.tag !== null);

const itemHooks = (items: readonly TagHook[]): TagHook[] =>
  items.filter((item) => item.tagName === 'LI');

const boxFor = async (page: Page, hook: TagHook): Promise<TagBox> => {
  const box = await page.getByTestId(hook.id).boundingBox();
  if (!box) throw new Error(`Missing geometry for ${hook.id}`);
  return {
    ...hook,
    left: box.x,
    top: box.y,
    width: box.width,
    height: box.height,
  };
};

const centerDistance = (left: TagBox, right: TagBox): number =>
  Math.hypot(
    left.left + left.width / 2 - (right.left + right.width / 2),
    left.top + left.height / 2 - (right.top + right.height / 2)
  );

const itemForLink = async (
  page: Page,
  link: TagBox,
  items: readonly TagHook[]
): Promise<TagHook> => {
  const itemBoxes = await Promise.all(items.map((item) => boxFor(page, item)));
  const nearest = itemBoxes.reduce((best, item) =>
    centerDistance(link, item) < centerDistance(link, best) ? item : best
  );
  return nearest;
};

test('tag directory presents weighted human-readable labels without chip chrome or visible counts', async ({
  page,
}) => {
  await page.goto('/tags/');

  const links = linkHooks(await hooks(page));
  expect(links.length).toBeGreaterThan(20);

  const hyphenated = links.find((link) => link.tag?.includes('-'));
  if (!hyphenated?.tag) throw new Error('Missing hyphenated tag sample');
  const hyphenatedLink = page.getByTestId(hyphenated.id);
  await expect(hyphenatedLink).toHaveText(hyphenated.tag.replaceAll('-', ' '));
  await expect(hyphenatedLink).toHaveAttribute('data-count', /^\d+$/);

  expect(links.every((link) => !link.text.includes('·'))).toBe(true);
  expect(links.every((link) => !link.text.includes('-'))).toBe(true);

  const visualChrome = await hyphenatedLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      textDecorationLine: style.textDecorationLine,
    };
  });
  expect(visualChrome.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(visualChrome.textDecorationLine).toBe('none');

  const visuals = await Promise.all(
    links.map(async (link) => {
      const style = await page.getByTestId(link.id).evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
          fontSize: parseFloat(computed.fontSize),
          fontWeight: Number(computed.fontWeight),
        };
      });
      return { ...style, weight: link.weight };
    })
  );
  const strongestVisual = visuals.reduce((best, item) =>
    item.weight > best.weight ? item : best
  );
  const weakestVisual = visuals.reduce((best, item) =>
    item.weight < best.weight ? item : best
  );
  expect(strongestVisual.weight).toBeGreaterThan(weakestVisual.weight);
  expect(strongestVisual.fontSize).toBeGreaterThan(weakestVisual.fontSize);
  expect(strongestVisual.fontWeight).toBeGreaterThan(weakestVisual.fontWeight);
});

test('tag cloud lays out responsively and gives hovered tags spatial focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/tags/');

  const cloud = page.getByTestId('tags-page-directory');
  await expect(cloud).toHaveAttribute('data-cloud-ready', 'true');
  const allHooks = await hooks(page);
  const links = linkHooks(allHooks);
  const items = itemHooks(allHooks);
  expect(items).toHaveLength(links.length);
  const linkBoxes = await Promise.all(links.map((link) => boxFor(page, link)));
  const cloudBox = await cloud.boundingBox();
  if (!cloudBox) throw new Error('Missing tag cloud geometry');
  const cloudCenter = {
    left: cloudBox.x,
    top: cloudBox.y,
    width: cloudBox.width,
    height: cloudBox.height,
  };
  const distanceFromCloudCenter = (target: TagBox): number =>
    Math.hypot(
      target.left +
        target.width / 2 -
        (cloudCenter.left + cloudCenter.width / 2),
      target.top +
        target.height / 2 -
        (cloudCenter.top + cloudCenter.height / 2)
    );
  const strongest = linkBoxes.find((link) => link.tag === 'ai');
  const weakest = linkBoxes.filter((link) => link.weight === 0);
  if (!strongest || weakest.length === 0)
    throw new Error('Missing weighted tag samples');
  const weakestAverage =
    weakest.reduce((sum, tag) => sum + distanceFromCloudCenter(tag), 0) /
    weakest.length;
  expect(distanceFromCloudCenter(strongest)).toBeLessThan(weakestAverage);

  const peer = linkBoxes
    .filter((candidate) => candidate.id !== strongest.id)
    .reduce((best, candidate) =>
      centerDistance(strongest, candidate) < centerDistance(strongest, best)
        ? candidate
        : best
    );
  const peerItem = await itemForLink(page, peer, items);
  const before = await page
    .getByTestId(peerItem.id)
    .evaluate((element) => getComputedStyle(element).transform);
  await page.getByTestId(strongest.id).hover();
  await expect
    .poll(() =>
      page
        .getByTestId(peerItem.id)
        .evaluate((element) => getComputedStyle(element).transform)
    )
    .not.toBe(before);

  await page.mouse.move(0, 0);
  const resizeLink = linkBoxes.find(
    (link) => link.tag === 'semantic-representation'
  );
  if (!resizeLink) throw new Error('Missing semantic-representation tag');
  const resizeItem = await itemForLink(page, resizeLink, items);
  const beforeResize = await page
    .getByTestId(resizeItem.id)
    .evaluate((element) => getComputedStyle(element).transform);

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
          page
            .getByTestId(resizeItem.id)
            .evaluate((element) => getComputedStyle(element).transform)
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
  const allHooks = await hooks(page);
  const links = linkHooks(allHooks);
  const items = itemHooks(allHooks);
  const focused = links.find((link) => link.tag === 'ai');
  if (!focused) throw new Error('Missing ai tag');
  const focusedBox = await boxFor(page, focused);
  const item = await itemForLink(page, focusedBox, items);
  expect(
    await page
      .getByTestId(item.id)
      .evaluate((element) => getComputedStyle(element).transitionDuration)
  ).toBe('0s');
});

import { expect, test, type Page } from '@playwright/test';

const systems = [
  'rosetta',
  'bilqis',
  'gnosis',
  'akasha',
  'codito',
  'indranet',
  'guard-tripwire',
] as const;
type System = (typeof systems)[number];
const tab = (page: Page, id: System) =>
  page.getByTestId(`uca-system-tab-${id}`);
const panel = (page: Page, id: System) =>
  page.getByTestId(`uca-system-panel-${id}`);
async function selected(page: Page, id: System): Promise<void> {
  for (const current of systems) {
    const active = current === id;
    await expect(tab(page, current)).toHaveAttribute('role', 'tab');
    await expect(tab(page, current)).toHaveAttribute(
      'aria-controls',
      `uca-panel-${current}`
    );
    await expect(tab(page, current)).toHaveAttribute(
      'aria-selected',
      String(active)
    );
    await expect(tab(page, current)).toHaveAttribute(
      'tabindex',
      active ? '0' : '-1'
    );
    await expect(panel(page, current)).toHaveAttribute('role', 'tabpanel');
    await expect(panel(page, current)).toHaveAttribute(
      'aria-labelledby',
      `uca-tab-${current}`
    );
    await expect(panel(page, current)).toHaveAttribute(
      'tabindex',
      active ? '0' : '-1'
    );
    if (active) await expect(panel(page, current)).toBeVisible();
    else await expect(panel(page, current)).toBeHidden();
  }
}

test('seven-stage structure, global chrome and every selectable system agree', async ({
  page,
}) => {
  await page.goto('/projects/');
  await expect(page.getByTestId('uca-page')).toBeVisible();
  for (const id of [
    'uca-stage-hero',
    'uca-stage-stakes',
    'uca-stage-pivot',
    'uca-architecture',
    'uca-research-responses',
    'uca-future-scenario',
    'uca-closing',
  ])
    await expect(page.getByTestId(id)).toHaveCount(1);
  await expect(page.getByTestId(/^uca-stake-/)).toHaveCount(5);
  await expect(
    page.getByTestId(
      /^uca-response-(meaning|inheritance|memory|authority|concentration|culture)$/
    )
  ).toHaveCount(6);
  await expect(page.getByTestId(/^uca-scenario-step-/)).toHaveCount(7);
  await expect(page.getByTestId(/^uca-system-tab-/)).toHaveCount(7);
  await expect(page.getByTestId(/^uca-system-panel-/)).toHaveCount(7);
  await expect(page.getByTestId('site-header')).toHaveCount(1);
  await expect(page.getByTestId('site-footer')).toHaveCount(1);
  expect(
    await page.evaluate(() => ({
      headings: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
    }))
  ).toEqual({ headings: 1, main: 1 });
  await selected(page, 'rosetta');
  for (const id of systems) {
    await tab(page, id).click();
    await selected(page, id);
    await expect(tab(page, id)).toBeFocused();
  }
});

test('vertical automatic activation wraps; Home/End, Space/Enter and Tab preserve logical focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/projects/');
  await expect(page.getByTestId('uca-system-list')).toHaveAttribute(
    'aria-orientation',
    'vertical'
  );
  await tab(page, 'rosetta').focus();
  for (const [key, id] of [
    ['ArrowUp', 'guard-tripwire'],
    ['ArrowDown', 'rosetta'],
    ['ArrowDown', 'bilqis'],
    ['End', 'guard-tripwire'],
    ['Home', 'rosetta'],
  ] as const) {
    await page.keyboard.press(key);
    await selected(page, id);
    await expect(tab(page, id)).toBeFocused();
  }
  await page.keyboard.press('ArrowRight');
  await selected(page, 'rosetta');
  await page.keyboard.press('Space');
  await selected(page, 'rosetta');
  await page.keyboard.press('Enter');
  await selected(page, 'rosetta');
  await page.keyboard.press('Tab');
  await expect(panel(page, 'rosetta')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(tab(page, 'rosetta')).toBeFocused();
  await tab(page, 'gnosis').focus();
  await selected(page, 'gnosis');
  await page.keyboard.press('Tab');
  await expect(panel(page, 'gnosis')).toBeFocused();
});

test('horizontal keyboard rail wraps and selection survives responsive orientation changes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/projects/');
  await tab(page, 'akasha').click();
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.getByTestId('uca-system-list')).toHaveAttribute(
    'aria-orientation',
    'horizontal'
  );
  await selected(page, 'akasha');
  await expect(tab(page, 'akasha')).toBeFocused();
  for (const [key, id] of [
    ['ArrowRight', 'codito'],
    ['End', 'guard-tripwire'],
    ['ArrowRight', 'rosetta'],
    ['ArrowLeft', 'guard-tripwire'],
    ['Home', 'rosetta'],
  ] as const) {
    await page.keyboard.press(key);
    await selected(page, id);
    await expect(tab(page, id)).toBeInViewport();
  }
  await page.keyboard.press('ArrowDown');
  await selected(page, 'rosetta');
  await tab(page, 'indranet').click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.getByTestId('uca-system-list')).toHaveAttribute(
    'aria-orientation',
    'vertical'
  );
  await selected(page, 'indranet');
  await expect(tab(page, 'indranet')).toBeFocused();
});

test('touch activation selects content and retains focus', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
    baseURL: test.info().project.use.baseURL ?? 'http://127.0.0.1:4322/',
  });
  try {
    const page = await context.newPage();
    await page.goto('/projects/');
    await tab(page, 'guard-tripwire').tap();
    await selected(page, 'guard-tripwire');
    await expect(tab(page, 'guard-tripwire')).toBeFocused();
  } finally {
    await context.close();
  }
});

test('static fallback preserves every section and fragment with JavaScript disabled', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: test.info().project.use.baseURL ?? 'http://127.0.0.1:4322/',
  });
  try {
    const page = await context.newPage();
    await page.goto('/projects/');
    for (const id of systems) {
      await expect(panel(page, id)).toBeVisible();
      await expect(tab(page, id)).not.toHaveAttribute('role', 'tab');
      await tab(page, id).focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`#uca-panel-${id}$`));
      await expect(panel(page, id)).toBeInViewport();
    }
    await expect(page.getByTestId(/^uca-project-link-/)).toHaveCount(4);
    for (const link of await page.getByTestId(/^uca-project-link-/).all())
      await expect(link).toBeVisible();
  } finally {
    await context.close();
  }
});

test('published detail/research routes, fragments, metadata and skip navigation remain usable', async ({
  page,
}) => {
  await page.goto('/projects/');
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('site-skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe(
    'main-content'
  );
  for (const id of ['rosetta', 'bilqis', 'codito', 'indranet'] as const) {
    await expect(page.getByTestId(`uca-project-link-${id}`)).toHaveAttribute(
      'href',
      `/projects/${id}/`
    );
    expect((await page.request.get(`/projects/${id}/`)).status()).toBe(200);
  }
  const publicLinks = await page
    .getByTestId('uca-page')
    .evaluate((el) =>
      Array.from(el.querySelectorAll<HTMLAnchorElement>('a[href]')).map(
        (a) => a.getAttribute('href') ?? ''
      )
    );
  for (const href of publicLinks) {
    expect(href).not.toMatch(
      /docs\.google\.com|drive\.google\.com|github\.com/i
    );
    if (href.startsWith('#'))
      expect(
        await page.evaluate(
          (id) => Boolean(document.getElementById(id)),
          href.slice(1)
        )
      ).toBe(true);
    else expect((await page.request.get(href)).status()).toBe(200);
  }
  expect(
    await page.evaluate(
      () =>
        document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href
    )
  ).toBe('https://entif.ai/projects/');
  await expect(
    page.getByTestId('uca-research-link-ETR-2026-07')
  ).toHaveAttribute(
    'href',
    '/articles/accelerating-the-dystopia/01-the-problem-is-the-substrate/'
  );
  await page.goto('/projects/#uca-panel-gnosis');
  await selected(page, 'gnosis');
});

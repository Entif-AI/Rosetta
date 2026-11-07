import { afterEach, describe, expect, it, vi } from 'vitest';
import { within } from '@testing-library/react';
import { enhanceArchitecture } from '../../src/scripts/uca-explorer';
import { systemIds } from '../../src/lib/showcase';

const fixture = (): HTMLElement => {
  const root = document.createElement('div');
  root.style.setProperty('--uca-compact-query', '"(max-width: 48rem)"');
  root.innerHTML = `<nav data-test-id="uca-system-list" data-uca-tablist>${systemIds
    .map(
      (id) =>
        `<a id="uca-tab-${id}" data-test-id="uca-system-tab-${id}" data-uca-tab data-system-id="${id}" href="#uca-panel-${id}">${id}</a>`
    )
    .join('')}</nav>${systemIds
    .map(
      (id) =>
        `<section data-test-id="uca-system-panel-${id}" data-uca-panel data-system-id="${id}" id="uca-panel-${id}" aria-labelledby="heading-${id}"><h3 id="heading-${id}">${id}</h3><p>Source content</p></section>`
    )
    .join('')}`;
  document.body.append(root);
  return root;
};
afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('progressive initialization failure', () => {
  it('leaves the complete document usable when the stylesheet is unavailable', () => {
    const root = fixture();
    root.style.removeProperty('--uca-compact-query');
    expect(enhanceArchitecture(root)).toBe(false);
    const view = within(root);
    for (const id of systemIds) {
      expect(
        view.getByTestId(`uca-system-panel-${id}`).hasAttribute('hidden')
      ).toBe(false);
      expect(
        view.getByTestId(`uca-system-tab-${id}`).hasAttribute('role')
      ).toBe(false);
      expect(
        view.getByTestId(`uca-system-tab-${id}`).getAttribute('href')
      ).toBe(`#uca-panel-${id}`);
    }
  });
  it('refuses mismatched section links without hiding content', () => {
    const root = fixture();
    const view = within(root);
    const firstId = systemIds[0];
    if (!firstId) throw new Error('Missing system fixture');
    view
      .getByTestId(`uca-system-tab-${firstId}`)
      .setAttribute('href', '#missing');
    expect(enhanceArchitecture(root)).toBe(false);
    for (const id of systemIds)
      expect(
        view.getByTestId(`uca-system-panel-${id}`).hasAttribute('hidden')
      ).toBe(false);
  });
  it('rolls back semantics and bound handlers after a late initialization error', () => {
    const root = fixture();
    const view = within(root);
    const list = view.getByTestId('uca-system-list');
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
    }));
    const set = list.setAttribute.bind(list);
    vi.spyOn(list, 'setAttribute').mockImplementation((name, value) => {
      if (name === 'aria-orientation')
        throw new Error('Injected initialization failure');
      set(name, value);
    });
    expect(enhanceArchitecture(root)).toBe(false);
    expect(list.getAttribute('role')).toBeNull();
    for (const id of systemIds) {
      const tab = view.getByTestId(`uca-system-tab-${id}`);
      const panel = view.getByTestId(`uca-system-panel-${id}`);
      expect(tab.hasAttribute('hidden')).toBe(false);
      expect(tab.hasAttribute('role')).toBe(false);
      expect(tab.hasAttribute('aria-selected')).toBe(false);
      expect(panel.hasAttribute('hidden')).toBe(false);
      expect(panel.hasAttribute('role')).toBe(false);
    }
    const firstId = systemIds[0];
    if (!firstId) throw new Error('Missing system fixture');
    const tab = view.getByTestId(`uca-system-tab-${firstId}`);
    expect(
      tab.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      )
    ).toBe(true);
    for (const id of systemIds)
      expect(
        view.getByTestId(`uca-system-panel-${id}`).hasAttribute('hidden')
      ).toBe(false);
  });
});

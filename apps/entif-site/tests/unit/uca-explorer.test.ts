import { afterEach, describe, expect, it, vi } from 'vitest';
import { enhanceArchitecture } from '../../src/scripts/uca-explorer';
import { systemIds } from '../../src/lib/showcase';

const fixture = (): HTMLElement => {
  const root = document.createElement('div');
  root.style.setProperty('--uca-compact-query', '"(max-width: 48rem)"');
  root.innerHTML = `<nav data-uca-tablist>${systemIds
    .map(
      (id) =>
        `<a id="uca-tab-${id}" data-uca-tab data-system-id="${id}" href="#uca-panel-${id}">${id}</a>`
    )
    .join('')}</nav>${systemIds
    .map(
      (id) =>
        `<section data-uca-panel data-system-id="${id}" id="uca-panel-${id}" aria-labelledby="heading-${id}"><h3 id="heading-${id}">${id}</h3><p>Source content</p></section>`
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
    expect(root.querySelectorAll('[hidden]')).toHaveLength(0);
    expect(root.querySelectorAll('[role="tab"]')).toHaveLength(0);
    expect(root.querySelectorAll('a[href]')).toHaveLength(7);
  });
  it('refuses mismatched section links without hiding content', () => {
    const root = fixture();
    root.querySelector('a')?.setAttribute('href', '#missing');
    expect(enhanceArchitecture(root)).toBe(false);
    expect(root.querySelectorAll('[hidden]')).toHaveLength(0);
  });
  it('rolls back semantics and bound handlers after a late initialization error', () => {
    const root = fixture();
    const list = root.querySelector<HTMLElement>('[data-uca-tablist]');
    if (!list) throw new Error('Missing fixture navigation');
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
    expect(
      root.querySelectorAll(
        '[hidden],[role="tab"],[role="tabpanel"],[aria-selected]'
      )
    ).toHaveLength(0);
    const tab = root.querySelector('a');
    if (!tab) throw new Error('Missing fixture link');
    expect(
      tab.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      )
    ).toBe(true);
    expect(root.querySelectorAll('[hidden]')).toHaveLength(0);
  });
});

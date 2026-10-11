// Reuse the server-rendered sections. Failed initialization preserves the document.
export function enhanceArchitecture(root: HTMLElement): boolean {
  if (root.dataset.enhanced === 'true') return true;
  const list = root.querySelector<HTMLElement>('[data-uca-tablist]');
  const tabs = Array.from(
    root.querySelectorAll<HTMLAnchorElement>('[data-uca-tab]')
  );
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>('[data-uca-panel]')
  );
  if (
    !list ||
    tabs.length !== 7 ||
    panels.length !== tabs.length ||
    tabs[0]?.dataset.systemId !== 'rosetta' ||
    new Set(tabs.map((tab) => tab.dataset.systemId)).size !== 7 ||
    tabs.some(
      (tab, index) =>
        !tab.id ||
        !tab.dataset.systemId ||
        !list.contains(tab) ||
        tab.hash !== `#${panels[index]?.id}` ||
        tab.dataset.systemId !== panels[index]?.dataset.systemId
    )
  )
    return false;

  // Sass emits this query from the shared breakpoint map; JS owns no second value.
  const query = getComputedStyle(root)
    .getPropertyValue('--uca-compact-query')
    .trim()
    .replace(/^(['"])(.*)\1$/, '$2');
  if (!query.startsWith('(max-width:')) return false;
  const attributes = (element: HTMLElement, names: string[]) => ({
    element,
    values: names.map((name) => [name, element.getAttribute(name)] as const),
  });
  const original = [
    attributes(list, ['role', 'aria-orientation']),
    ...tabs.map((tab) =>
      attributes(tab, ['role', 'aria-controls', 'aria-selected', 'tabindex'])
    ),
    ...panels.map((panel) =>
      attributes(panel, ['role', 'aria-labelledby', 'tabindex', 'hidden'])
    ),
  ];
  const events = new AbortController();
  let selected = 0;
  try {
    const narrow = window.matchMedia(query);
    const revealTab = (tab: HTMLElement) => {
      if (!narrow.matches) return;
      const rail = list.getBoundingClientRect();
      const box = tab.getBoundingClientRect();
      // Scroll the rail alone, leaving the reader's vertical position undisturbed.
      if (box.left < rail.left + 8) list.scrollLeft += box.left - rail.left - 8;
      else if (box.right > rail.right - 8)
        list.scrollLeft += box.right - rail.right + 8;
    };
    const select = (index: number, focus = false) => {
      const chosen = tabs[index];
      if (!chosen) return;
      selected = index;
      tabs.forEach((tab, i) => {
        const active = i === selected;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        const panel = panels[i];
        if (!panel) return;
        panel.hidden = !active;
        panel.tabIndex = active ? 0 : -1;
      });
      root.dataset.selected = chosen.dataset.systemId;
      if (focus) {
        chosen.focus({ preventScroll: true });
        if (!narrow.matches)
          chosen.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      }
      revealTab(chosen);
    };
    const orient = () => {
      list.setAttribute(
        'aria-orientation',
        narrow.matches ? 'horizontal' : 'vertical'
      );
      const current = tabs[selected];
      if (current && current === document.activeElement) revealTab(current);
    };
    const followFragment = () => {
      const index = panels.findIndex(
        (panel) => `#${panel.id}` === window.location.hash
      );
      if (index >= 0) select(index);
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('focus', () => select(index), {
        signal: events.signal,
      });
      tab.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          select(index, true);
        },
        { signal: events.signal }
      );
      tab.addEventListener(
        'keydown',
        (event) => {
          const next = narrow.matches ? 'ArrowRight' : 'ArrowDown';
          const previous = narrow.matches ? 'ArrowLeft' : 'ArrowUp';
          let target: number;
          if (event.key === next) target = (index + 1) % tabs.length;
          else if (event.key === previous)
            target = (index + tabs.length - 1) % tabs.length;
          else if (event.key === 'Home') target = 0;
          else if (event.key === 'End') target = tabs.length - 1;
          else if (event.key === 'Enter' || event.key === ' ') target = index;
          else return;
          event.preventDefault();
          select(target, true);
        },
        { signal: events.signal }
      );
    });
    narrow.addEventListener('change', orient, { signal: events.signal });
    window.addEventListener('hashchange', followFragment, {
      signal: events.signal,
    });
    // Bind every handler before switching semantics or hiding source content.
    list.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      const panel = panels[index];
      if (!panel) return;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
    });
    root.dataset.enhanced = 'true';
    orient();
    select(0);
    followFragment();
    return true;
  } catch {
    events.abort();
    original.forEach(({ element, values }) =>
      values.forEach(([name, value]) => {
        if (value === null) element.removeAttribute(name);
        else element.setAttribute(name, value);
      })
    );
    delete root.dataset.enhanced;
    delete root.dataset.selected;
    return false;
  }
}

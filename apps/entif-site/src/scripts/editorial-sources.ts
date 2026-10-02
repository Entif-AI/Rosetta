const sourceHashId = () => {
  let hash;
  try {
    hash = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return null;
  }
  return hash.startsWith('source-') ? hash : null;
};

const normalizeTerms = (query: string) =>
  query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);

export function enhanceEditorialSources() {
  const explorer = document.querySelector<HTMLElement>('[data-source-explorer]');
  if (!explorer || explorer.dataset.sourceExplorerReady) return;

  const form = explorer.querySelector<HTMLFormElement>('[data-test-id="editorial-source-search"]');
  const input = explorer.querySelector<HTMLInputElement>('[data-test-id="editorial-source-search-input"]');
  const count = explorer.querySelector<HTMLElement>('[data-test-id="editorial-source-search-count"]');
  const noMatches = explorer.querySelector<HTMLElement>('[data-test-id="editorial-source-no-matches"]');
  const entries = Array.from(explorer.querySelectorAll<HTMLElement>('[data-test-id="editorial-source"]'));
  if (!form || !input || !count || !noMatches) return;

  const matches = (entry: HTMLElement, terms: string[]) => {
    const link = entry.querySelector<HTMLAnchorElement>('[data-test-id="editorial-source-url"]');
    const searchable = `${entry.textContent ?? ''} ${link?.href ?? ''}`.toLocaleLowerCase();
    return terms.every((term) => searchable.includes(term));
  };

  const applyFilter = () => {
    const terms = normalizeTerms(input.value);
    const visible = entries.filter((entry) => {
      const isVisible = matches(entry, terms);
      entry.hidden = !isVisible;
      return isVisible;
    });
    count.textContent = `${visible.length} of ${entries.length} sources shown`;
    noMatches.hidden = visible.length !== 0;
  };

  const revealHashSource = () => {
    const id = sourceHashId();
    const target = id && entries.find((entry) => entry.id === id);
    if (!target || !target.hidden) return;
    form.reset();
    applyFilter();
    target.scrollIntoView({ block: 'start' });
  };

  form.hidden = false;
  explorer.dataset.sourceExplorerReady = 'true';
  applyFilter();
  input.addEventListener('input', applyFilter);
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('reset', () => queueMicrotask(applyFilter));
  window.addEventListener('hashchange', revealHashSource);
  revealHashSource();
}

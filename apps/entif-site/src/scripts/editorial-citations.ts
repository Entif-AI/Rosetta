export function enhanceCitations(): void {
  const series = document.querySelector<HTMLElement>(
    '[data-test-id="editorial-series"]'
  );
  const nav = document.querySelector<HTMLElement>(
    '[data-test-id="editorial-navigation"]'
  );
  if (series && nav) {
    new ResizeObserver(() => {
      series.style.setProperty(
        '--editorial-nav-height',
        `${nav.offsetHeight}px`
      );
    }).observe(nav);
  }
  if (!('showPopover' in HTMLElement.prototype)) return;
  for (const citation of document.querySelectorAll<HTMLElement>(
    '[data-test-id="editorial-citation"]'
  )) {
    const trigger = citation.querySelector<HTMLButtonElement>(
      '[data-test-id="citation-trigger"]'
    );
    const panel = citation.querySelector<HTMLElement>(
      '[data-test-id="citation-panel"]'
    );
    const close = citation.querySelector<HTMLButtonElement>(
      '[data-test-id="citation-close"]'
    );
    if (!trigger || !panel || !close) continue;
    trigger.hidden = false;
    trigger.setAttribute('popovertarget', panel.id);
    for (const fallback of citation.querySelectorAll<HTMLElement>(
      '[data-test-id="citation-fallback"]'
    ))
      fallback.hidden = true;
    let restoringFocus = false;
    let leaveTimer: ReturnType<typeof setTimeout> | undefined;
    const cancelLeave = () => clearTimeout(leaveTimer);
    const position = () => {
      const anchor = trigger.getBoundingClientRect();
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      const left = Math.max(
        16,
        Math.min(anchor.left, window.innerWidth - width - 16)
      );
      const top =
        anchor.bottom + height + 16 <= window.innerHeight
          ? anchor.bottom + 4
          : Math.max(16, anchor.top - height - 4);
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    };
    const open = () => {
      cancelLeave();
      if (restoringFocus) return;
      panel.showPopover();
      trigger.setAttribute('aria-expanded', 'true');
      position();
    };
    const dismiss = (restore: boolean) => {
      cancelLeave();
      panel.hidePopover();
      trigger.setAttribute('aria-expanded', 'false');
      if (restore) {
        restoringFocus = true;
        trigger.focus({ preventScroll: true });
        restoringFocus = false;
      }
    };
    trigger.addEventListener('focus', open);
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      open();
    });
    trigger.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') open();
    });
    panel.addEventListener('pointerenter', cancelLeave);
    citation.addEventListener('pointerleave', () => {
      leaveTimer = setTimeout(() => {
        if (!citation.contains(document.activeElement)) dismiss(false);
      }, 200);
    });
    citation.addEventListener('focusout', (event) => {
      if (
        event.relatedTarget instanceof Node &&
        !citation.contains(event.relatedTarget)
      )
        dismiss(false);
    });
    citation.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss(true);
      }
    });
    close.addEventListener('click', () => dismiss(true));
    panel.addEventListener('toggle', () => {
      const expanded = panel.matches(':popover-open');
      trigger.setAttribute('aria-expanded', String(expanded));
      // Track viewport changes only while a popover is open.
      if (expanded) window.addEventListener('resize', position);
      else window.removeEventListener('resize', position);
    });
  }
}

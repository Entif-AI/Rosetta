/** Reading position emphasizes an existing diagram; it never gates its content. */
export function enhanceScrollStories() {
  if (!('IntersectionObserver' in window)) return;

  document.querySelectorAll<HTMLElement>('[data-scroll-story]').forEach((story) => {
    if (story.dataset.scrollReady) return;
    const steps = [...story.querySelectorAll<HTMLElement>('[data-scroll-step]')];
    if (!steps.length) return;
    const layers = [...story.querySelectorAll<HTMLElement | SVGElement>('[data-scroll-layer]')];
    const positions = new Map(steps.map((step, index) => [step.dataset.scrollStep, index]));
    const visual = story.querySelector<HTMLElement>('.scroll-story-visual');
    let active = 0;
    const controls = document.createElement('div');
    controls.className = 'scroll-story-controls';
    controls.dataset.testId = 'scroll-controls';
    const previous = document.createElement('button');
    const next = document.createElement('button');
    const position = document.createElement('span');
    previous.type = next.type = 'button';
    previous.textContent = '← Back';
    next.textContent = 'Next →';
    previous.setAttribute('aria-label', 'Previous diagram step');
    next.setAttribute('aria-label', 'Next diagram step');
    previous.dataset.testId = 'scroll-previous';
    next.dataset.testId = 'scroll-next';
    position.dataset.testId = 'scroll-position';
    controls.append(previous, position, next);
    visual?.append(controls);
    const move = (direction: number) => {
      steps[active + direction]?.scrollIntoView({
        block: 'center',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));

    const update = () => {
      const readingLine = window.innerHeight * 0.5;
      active = 0;
      steps.forEach((step, index) => {
        if (step.getBoundingClientRect().top <= readingLine) active = index;
      });
      story.dataset.scrollActive = steps[active]?.dataset.scrollStep;
      previous.disabled = active === 0;
      next.disabled = active === steps.length - 1;
      position.textContent = `${active + 1} / ${steps.length}`;
      position.setAttribute('aria-label', `Diagram step ${active + 1} of ${steps.length}`);
      const state = (index: number) => index === active ? 'active' : index < active ? 'past' : 'future';
      steps.forEach((step, index) => { step.dataset.scrollState = state(index); });
      layers.forEach((layer) => {
        const index = positions.get(layer.dataset.scrollLayer);
        if (index !== undefined) layer.dataset.scrollState = state(index);
      });
    };

    // Observe crossings of the reading line, in either direction, without a scroll loop.
    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      // Root-margin percentages use width, so measure the viewport's vertical axis.
      observer = new IntersectionObserver(update, {
        rootMargin: `-${Math.floor(window.innerHeight * 0.49)}px 0px -${Math.floor(window.innerHeight * 0.5)}px 0px`,
        threshold: 0,
      });
      steps.forEach((step) => observer.observe(step));
      update();
    };
    observe();
    window.addEventListener('resize', observe, { passive: true });
    story.dataset.scrollReady = 'true';
    update();
  });
}

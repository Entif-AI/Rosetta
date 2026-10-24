type AtlasView = 'text' | 'visual';

interface MotionGroup {
  readonly element: SVGGraphicsElement;
  readonly dx: number;
  readonly dy: number;
  readonly rotation: number;
  readonly scale: number;
  readonly start: number;
  readonly end: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly fades: boolean;
}

const clamp = (value: number, minimum = 0, maximum = 1): number =>
  Math.max(minimum, Math.min(maximum, value));

const ease = (value: number): number => value * value * (3 - 2 * value);

const numericDataset = (
  element: HTMLElement | SVGElement,
  key: string,
  fallback: number
): number => {
  const value = element.dataset[key];
  return value === undefined ? fallback : Number(value);
};

const scrollProgress = (rect: DOMRect, viewportHeight: number): number => {
  const start = viewportHeight * 0.8;
  return clamp(
    (start - rect.top) / Math.max(1, rect.height - viewportHeight * 0.2)
  );
};

export const enhanceAtlas = (): void => {
  const root = document.querySelector<HTMLElement>('[data-atlas-root]');
  if (root === null) return;

  const viewButton = root.querySelector<HTMLButtonElement>(
    '[data-atlas-view-toggle]'
  );
  const motionButton = root.querySelector<HTMLButtonElement>(
    '[data-atlas-motion-toggle]'
  );
  const jumper = root.querySelector<HTMLElement>('[data-atlas-scene-jumper]');
  const previousButton = root.querySelector<HTMLButtonElement>(
    '[data-atlas-scene-previous]'
  );
  const nextButton = root.querySelector<HTMLButtonElement>(
    '[data-atlas-scene-next]'
  );
  const currentLabel = root.querySelector<HTMLElement>(
    '[data-atlas-scene-current]'
  );

  if (
    viewButton === null ||
    motionButton === null ||
    jumper === null ||
    previousButton === null ||
    nextButton === null ||
    currentLabel === null
  ) {
    return;
  }

  const scenes = Array.from(
    root.querySelectorAll<HTMLElement>('.scene.scroll-scene')
  );
  const scrollSections = Array.from(
    root.querySelectorAll<HTMLElement>('.scroll-scene')
  );
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storedView = sessionStorage.getItem('atlas-view');
  let view: AtlasView = storedView === 'visual' ? 'visual' : 'text';
  let userMotion = sessionStorage.getItem('atlas-motion') !== 'off';
  let activeIndex = 0;
  let frameRequested = false;
  const activeSections = new Set<HTMLElement>(scrollSections.slice(0, 2));
  const motionGroups = new Map<HTMLElement, readonly MotionGroup[]>();

  for (const section of scrollSections) {
    const groups = Array.from(
      section.querySelectorAll<SVGGraphicsElement>('[data-animate]')
    ).map((element) => ({
      element,
      dx: numericDataset(element, 'dx', 0),
      dy: numericDataset(element, 'dy', 0),
      rotation: numericDataset(element, 'rot', 0),
      scale: numericDataset(element, 'scale', 1),
      start: numericDataset(element, 'start', 0),
      end: numericDataset(element, 'end', 1),
      centerX: numericDataset(element, 'cx', 500),
      centerY: numericDataset(element, 'cy', 380),
      fades: element.dataset.fade === '1',
    }));
    motionGroups.set(section, groups);
  }

  const reducedMotion = (): boolean => motionQuery.matches || !userMotion;

  const paint = (section: HTMLElement, progress: number): void => {
    section.dataset.progress = progress.toFixed(5);
    for (const group of motionGroups.get(section) ?? []) {
      const local = ease(
        clamp(
          (progress - group.start) / Math.max(0.001, group.end - group.start)
        )
      );
      const x = (local - 0.5) * group.dx;
      const y = (local - 0.5) * group.dy;
      const angle = (local - 0.5) * group.rotation;
      const scale = 1 + (group.scale - 1) * local;
      group.element.setAttribute(
        'transform',
        `translate(${x.toFixed(3)} ${y.toFixed(3)}) translate(${
          group.centerX
        } ${group.centerY}) rotate(${angle.toFixed(3)}) scale(${scale.toFixed(
          4
        )}) translate(${-group.centerX} ${-group.centerY})`
      );
      if (group.fades) {
        group.element.style.opacity = String(0.25 + 0.75 * local);
      }
    }

    const meter = section.querySelector<HTMLElement>('.scene-progress');
    if (meter !== null) {
      meter.style.width = `${progress * 100}%`;
    }
  };

  const frame = (): void => {
    frameRequested = false;
    if (view !== 'visual') return;

    const viewportHeight = window.innerHeight;
    let current: HTMLElement | undefined;
    let distance = Number.POSITIVE_INFINITY;

    for (const section of activeSections) {
      const rect = section.getBoundingClientRect();
      paint(
        section,
        reducedMotion() ? 0.65 : scrollProgress(rect, viewportHeight)
      );
      if (section.classList.contains('scene')) {
        const candidateDistance = Math.abs(rect.top - viewportHeight * 0.3);
        if (
          rect.top <= viewportHeight * 0.4 &&
          rect.bottom >= viewportHeight * 0.3 &&
          candidateDistance < distance
        ) {
          current = section;
          distance = candidateDistance;
        }
      }
    }

    if (current !== undefined) {
      activeIndex = scenes.indexOf(current);
      currentLabel.textContent = `${String(activeIndex + 1).padStart(
        2,
        '0'
      )} / ${scenes.length}`;
    }
  };

  const requestFrame = (): void => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(frame);
  };

  const setMode = (): void => {
    const reduced = reducedMotion();
    root.dataset.atlasView = view;
    root.dataset.atlasMotion = reduced ? 'reduced' : 'active';
    viewButton.hidden = false;
    viewButton.setAttribute('aria-pressed', String(view === 'visual'));
    viewButton.textContent = view === 'visual' ? 'Text only' : 'Visualize';
    motionButton.hidden = view !== 'visual';
    motionButton.setAttribute('aria-pressed', String(!reduced));
    motionButton.textContent = reduced ? 'Motion: off' : 'Motion: on';
    jumper.hidden = view !== 'visual' || scenes.length === 0;

    if (view === 'visual') {
      for (const section of scrollSections) {
        const rect = section.getBoundingClientRect();
        paint(
          section,
          reduced ? 0.65 : scrollProgress(rect, window.innerHeight)
        );
      }
      requestFrame();
    }
  };

  const jump = (delta: number): void => {
    const target = scenes[clamp(activeIndex + delta, 0, scenes.length - 1)];
    if (target === undefined) return;
    target.scrollIntoView({
      behavior: reducedMotion() ? 'instant' : 'smooth',
      block: 'start',
    });
  };

  viewButton.addEventListener('click', () => {
    view = view === 'text' ? 'visual' : 'text';
    sessionStorage.setItem('atlas-view', view);
    setMode();
  });

  motionButton.addEventListener('click', () => {
    userMotion = !userMotion;
    sessionStorage.setItem('atlas-motion', userMotion ? 'on' : 'off');
    setMode();
  });

  previousButton.addEventListener('click', () => jump(-1));
  nextButton.addEventListener('click', () => jump(1));

  const handleMotionPreference = (): void => setMode();
  motionQuery.addEventListener('change', handleMotionPreference);
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame, { passive: true });
  window.addEventListener('orientationchange', requestFrame, { passive: true });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target;
          if (!(element instanceof HTMLElement)) continue;
          if (entry.isIntersecting) activeSections.add(element);
          else activeSections.delete(element);
        }
        requestFrame();
      },
      { rootMargin: '65% 0px 65% 0px', threshold: 0 }
    );
    for (const section of scrollSections) observer.observe(section);
  } else {
    for (const section of scrollSections) activeSections.add(section);
  }

  setMode();
};

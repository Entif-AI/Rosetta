interface CloudItem {
  readonly item: HTMLElement;
  readonly link: HTMLElement;
  readonly weight: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const overlaps = (left: Box, right: Box, gap: number): boolean =>
  left.x < right.x + right.width + gap &&
  left.x + left.width + gap > right.x &&
  left.y < right.y + right.height + gap &&
  left.y + left.height + gap > right.y;

const distance = (left: CloudItem, right: CloudItem): number => {
  const leftX = left.x + left.width / 2;
  const leftY = left.y + left.height / 2;
  const rightX = right.x + right.width / 2;
  const rightY = right.y + right.height / 2;
  return Math.hypot(rightX - leftX, rightY - leftY);
};

export function enhanceTagCloud(): void {
  const cloud = document.querySelector<HTMLElement>('[data-tag-cloud]');
  if (!cloud || cloud.dataset.cloudEnhanced === 'true') return;

  const items: CloudItem[] = [];
  for (const item of cloud.querySelectorAll<HTMLElement>(
    '[data-tag-cloud-item]'
  )) {
    const link = item.querySelector<HTMLElement>(
      '[data-test-id="tag-cloud-link"]'
    );
    if (!link) continue;
    const weight = Number(link.dataset.weight);
    items.push({
      item,
      link,
      weight: Number.isFinite(weight) ? weight : 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  }
  if (items.length === 0) return;

  items.sort((left, right) => right.weight - left.weight);
  cloud.dataset.cloudEnhanced = 'true';

  let active: CloudItem | undefined;
  let layoutFrame = 0;

  const applyPositions = (): void => {
    if (active) {
      const influence = Math.max(120, Math.min(240, cloud.clientWidth * 0.24));
      for (const item of items) {
        if (item === active) {
          item.item.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
          item.link.dataset.focused = 'true';
          continue;
        }

        delete item.link.dataset.focused;
        const itemDistance = distance(active, item);
        if (itemDistance >= influence || itemDistance === 0) {
          item.item.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
          continue;
        }

        const activeX = active.x + active.width / 2;
        const activeY = active.y + active.height / 2;
        const itemX = item.x + item.width / 2;
        const itemY = item.y + item.height / 2;
        const strength = (1 - itemDistance / influence) * 22;
        const dx = ((itemX - activeX) / itemDistance) * strength;
        const dy = ((itemY - activeY) / itemDistance) * strength;
        item.item.style.transform = `translate3d(${item.x + dx}px, ${
          item.y + dy
        }px, 0)`;
      }
      return;
    }

    for (const item of items) {
      delete item.link.dataset.focused;
      item.item.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
    }
  };

  const layout = (): void => {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(() => {
      const width = cloud.clientWidth;
      if (width <= 0) return;

      const compact = width < 480;
      const padding = compact ? 4 : 10;
      const gap = compact ? 5 : 8;
      const minimumHeight = compact
        ? Math.max(300, width * 1.12)
        : Math.max(360, width * 0.48);

      for (const item of items) {
        item.width = item.link.offsetWidth;
        item.height = item.link.offsetHeight;
      }

      let height = minimumHeight;
      let placed = false;
      let placements: Box[] = [];

      for (let attempt = 0; attempt < 7 && !placed; attempt += 1) {
        placements = [];
        placed = true;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
          const item = items[itemIndex];
          if (!item) continue;
          let found = false;

          for (let step = 0; step < 1800; step += 1) {
            const radius = step * (compact ? 0.52 : 0.68);
            const angle = step * 0.37 + itemIndex * 0.19;
            const x = centerX + Math.cos(angle) * radius - item.width / 2;
            const y =
              centerY +
              Math.sin(angle) * radius * (compact ? 0.9 : 0.7) -
              item.height / 2;
            const box = { x, y, width: item.width, height: item.height };

            if (
              x < padding ||
              y < padding ||
              x + item.width > width - padding ||
              y + item.height > height - padding ||
              placements.some((candidate) => overlaps(box, candidate, gap))
            ) {
              continue;
            }

            item.x = x;
            item.y = y;
            placements.push(box);
            found = true;
            break;
          }

          if (!found) {
            placed = false;
            height *= 1.18;
            break;
          }
        }
      }

      cloud.style.height = `${Math.ceil(height)}px`;
      applyPositions();
      cloud.dataset.cloudReady = 'true';
    });
  };

  const setActive = (item: CloudItem | undefined): void => {
    if (active === item) return;
    active = item;
    applyPositions();
  };

  for (const item of items) {
    item.link.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen')
        setActive(item);
    });
    item.link.addEventListener('pointerleave', () => setActive(undefined));
    item.link.addEventListener('focus', () => setActive(item));
    item.link.addEventListener('blur', () => setActive(undefined));
  }

  new ResizeObserver(layout).observe(cloud);
  layout();
}

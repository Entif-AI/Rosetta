import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TopicExplorer } from '../../src/components/TopicExplorer';
import type { ContentCardData } from '../../src/lib/content';

const cards: readonly ContentCardData[] = [
  {
    id: 'entif.research.memory',
    href: '/research/memory/',
    title: 'Memory research',
    description: 'Research about durable agentic memory and provenance.',
    kind: 'research',
    tags: ['memory', 'agentic-systems'],
    projects: ['rosetta'],
  },
  {
    id: 'entif.research.semantic',
    href: '/research/semantic/',
    title: 'Semantic research',
    description: 'Research about machine-readable semantic representation.',
    kind: 'research',
    tags: ['semantic-representation'],
    projects: ['rosetta'],
  },
];

describe('TopicExplorer', () => {
  it('shows all cards initially', () => {
    render(<TopicExplorer cards={cards} />);

    expect(
      screen.getByTestId('topic-result-count').getAttribute('data-result-count')
    ).toBe('2');
    expect(screen.getByTestId('topic-card-entif.research.memory')).toBeTruthy();
    expect(
      screen.getByTestId('topic-card-entif.research.semantic')
    ).toBeTruthy();
    expect(
      screen.getByTestId('topic-filter-all').getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('filters to a selected topic and exposes pressed state', async () => {
    const user = userEvent.setup();
    render(<TopicExplorer cards={cards} />);

    const filter = screen.getByTestId('topic-filter-memory');
    await user.click(filter);

    expect(filter.getAttribute('aria-pressed')).toBe('true');
    expect(
      screen.getByTestId('topic-result-count').getAttribute('data-result-count')
    ).toBe('1');
    expect(screen.getByTestId('topic-card-entif.research.memory')).toBeTruthy();
    expect(
      screen.queryByTestId('topic-card-entif.research.semantic')
    ).toBeNull();
  });

  it('can reset a topic filter to all results', async () => {
    const user = userEvent.setup();
    render(<TopicExplorer cards={cards} />);

    await user.click(screen.getByTestId('topic-filter-memory'));
    await user.click(screen.getByTestId('topic-filter-all'));

    expect(
      screen.getByTestId('topic-result-count').getAttribute('data-result-count')
    ).toBe('2');
  });

  it('renders an explicit empty state for an empty published corpus', () => {
    render(<TopicExplorer cards={[]} />);

    expect(
      screen.getByTestId('topic-result-count').getAttribute('data-result-count')
    ).toBe('0');
    expect(screen.getByTestId('topic-empty-state')).toBeTruthy();
  });
});

import { useMemo, useState, type ReactElement } from 'react';
import type { ContentCardData } from '../lib/content';

interface TopicExplorerProps {
  readonly cards: readonly ContentCardData[];
}

const topicFilterTestId = (topic: string): string =>
  `topic-filter-${encodeURIComponent(topic)}`;
const topicCardTestId = (id: string): string =>
  `topic-card-${encodeURIComponent(id)}`;

export function TopicExplorer({ cards }: TopicExplorerProps): ReactElement {
  const topics = useMemo(
    () => [...new Set(cards.flatMap((card) => card.tags))].sort(),
    [cards]
  );
  const [activeTopic, setActiveTopic] = useState<string>('all');

  const visibleCards = useMemo(
    () =>
      activeTopic === 'all'
        ? cards
        : cards.filter((card) => card.tags.includes(activeTopic)),
    [activeTopic, cards]
  );

  return (
    <section
      className="topic-explorer"
      aria-labelledby="research-heading"
      data-test-id="topic-explorer"
    >
      <div
        className="topic-controls"
        role="group"
        aria-label="Filter research by topic"
        data-test-id="topic-filters"
      >
        <button
          type="button"
          aria-pressed={activeTopic === 'all'}
          onClick={() => setActiveTopic('all')}
          data-test-id="topic-filter-all"
        >
          All
        </button>
        {topics.map((topic) => (
          <button
            key={topic}
            type="button"
            aria-pressed={activeTopic === topic}
            onClick={() => setActiveTopic(topic)}
            data-test-id={topicFilterTestId(topic)}
          >
            {topic}
          </button>
        ))}
      </div>
      <p
        className="result-count"
        role="status"
        aria-live="polite"
        data-test-id="topic-result-count"
        data-result-count={visibleCards.length}
      >
        {visibleCards.length} {visibleCards.length === 1 ? 'result' : 'results'}
      </p>
      {visibleCards.length === 0 ? (
        <p className="empty-state" data-test-id="topic-empty-state">
          No published work matches this topic yet.
        </p>
      ) : (
        <ul className="explorer-grid" data-test-id="topic-results">
          {visibleCards.map((card) => (
            <li key={card.id}>
              <article
                className="content-card"
                data-test-id={topicCardTestId(card.id)}
              >
                <div className="card-meta">
                  <span className="eyebrow">{card.kind}</span>
                  {card.projects.length > 0 ? (
                    <span>{card.projects.join(' · ')}</span>
                  ) : null}
                </div>
                <h3>
                  <a href={card.href}>{card.title}</a>
                </h3>
                <p>{card.description}</p>
                {card.tags.length > 0 ? (
                  <ul
                    className="tag-list"
                    aria-label={`Topics for ${card.title}`}
                  >
                    {card.tags.slice(0, 4).map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  createMarkdownProcessor,
  parseFrontmatter,
} from '@astrojs/markdown-remark';
import { expect, it } from 'vitest';

interface Snapshot {
  id: string;
  slug: string;
  sourceDigest: string;
  publicBodyDigest: string;
  normalizedSourceBodyDigest?: string;
  publicationScope: string;
}
const inventory = JSON.parse(
  readFileSync('evidence/about/content-sources.json', 'utf8')
) as { documents: Snapshot[] };
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const normalize = (text: string) =>
  text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replaceAll('–', '-')
    .replaceAll('—', '--')
    .replaceAll('…', '...')
    .replace(/\s+/g, ' ')
    .trim();

it('renders the complete public source bodies recorded at intake, preserving dates and evidence text', async () => {
  const processor = await createMarkdownProcessor();
  for (const snapshot of inventory.documents) {
    const { content, frontmatter } = parseFrontmatter(
      readFileSync(`content/doctrine/${snapshot.slug}.md`, 'utf8')
    );
    expect(frontmatter.id).toBe(snapshot.id);
    expect(frontmatter.sourceDigest).toBe(snapshot.sourceDigest);
    expect(hash(content)).toBe(snapshot.publicBodyDigest);
    expect(content).not.toMatch(
      /https?:\/\/(?:docs|drive)\.google\.com|IPR-\d{4}|private-ip/i
    );
    const article = document.createElement('article');
    article.innerHTML = (await processor.render(content)).code;
    const rendered = normalize(article.textContent ?? '');
    if (snapshot.id === 'D05') {
      expect(snapshot.publicationScope).toBe('public-overview');
      expect(snapshot.normalizedSourceBodyDigest).toBeUndefined();
      expect(rendered).toContain('internal preparatory document');
    } else {
      expect(hash(rendered), snapshot.id).toBe(
        snapshot.normalizedSourceBodyDigest
      );
    }
  }
});

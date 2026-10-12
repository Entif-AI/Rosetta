import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const root = process.cwd() + '/';
describe('publication and design contract', () => {
  it('provides the requested navigation and publication sections', () => {
    for (const path of [
      'content/ui/en.md',
      'src/pages/research/index.astro',
      'src/pages/articles/index.astro',
      'src/pages/about/index.astro',
      'Design.MD',
    ]) {
      expect(existsSync(root + path), path).toBe(true);
    }
  });
  it('caches builds with deployment URL and base in their inputs', () => {
    const project = JSON.parse(readFileSync(root + 'project.json', 'utf8'));
    expect(project.targets.build.cache).toBe(true);
    expect(project.targets.build.inputs).toContainEqual({
      env: 'ENTIF_SITE_URL',
    });
    expect(project.targets.build.inputs).toContainEqual({
      env: 'ENTIF_SITE_BASE',
    });
  });
});

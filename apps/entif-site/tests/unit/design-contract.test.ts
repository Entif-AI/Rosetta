import { readFileSync, existsSync, readdirSync } from 'node:fs';
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

  it('uses only stable test ids to locate project-owned UI in tests', () => {
    const forbidden = [
      new RegExp('\\.locator\\('),
      new RegExp(['query', 'Selector(?:All)?\\('].join('')),
      new RegExp(['getElement', 'ById\\('].join('')),
      new RegExp('\\.nth\\('),
      new RegExp('\\.first\\(\\)'),
    ];
    const failures = readdirSync(root + 'tests', { recursive: true })
      .filter(
        (path): path is string =>
          typeof path === 'string' && /\.(?:ts|tsx)$/.test(path)
      )
      .flatMap((path) => {
        const source = readFileSync(root + 'tests/' + path, 'utf8');
        return forbidden
          .filter((pattern) => pattern.test(source))
          .map((pattern) => `${path}: ${pattern.source}`);
      });

    expect(failures).toEqual([]);
  });
});

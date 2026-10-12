import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
const load = (file) => JSON.parse(readFileSync(`packages/nx-governance/${file}`, 'utf8'));
describe('portable distribution #1701', () => {
  it('ships all declared plugin and bundle entrypoints as one compatible unit', () => {
    const pkg = load('package.json');
    expect(pkg.private).toBe(false);
    for (const file of ['executors.json', 'migrations.json', 'spec-kit', 'README.md']) expect(pkg.files).toContain(file);
    expect(pkg.peerDependencies.nx).toBe('>=22.6.5 <23');
    const bundle = load('spec-kit/bundle.yml');
    expect(bundle.bundle.version).toBe(pkg.version);
    expect(bundle.bundle.integration).toBeUndefined();
    expect(bundle.provides.extensions[0]).toMatchObject({ id: 'rosetta-governance', version: pkg.version, source: 'extension' });
    expect(bundle.provides.presets[0]).toMatchObject({ id: 'entif-rosetta', version: pkg.version, source: 'preset' });
    expect(bundle.provides.workflows[0]).toMatchObject({ id: 'entif-roadmap', version: pkg.version, source: 'workflow' });
  });
});

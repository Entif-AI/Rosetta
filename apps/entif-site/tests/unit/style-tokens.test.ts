// @vitest-environment node
import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';
import { expect, it } from 'vitest';

const configFile = fileURLToPath(
  new URL('../../stylelint.config.mjs', import.meta.url)
);
const codeFilename = fileURLToPath(
  new URL('../../src/styles/token-probe.scss', import.meta.url)
);

it('admits canonical runtime tokens and rejects an undefined custom property', async () => {
  for (const [property, count] of [
    ['--ink', 0],
    ['--misspelled-site-token', 1],
  ] as const) {
    const result = await stylelint.lint({
      code: `.token-probe { color: var(${property}); }`,
      configFile,
      codeFilename,
    });
    expect(
      result.results
        .flatMap(({ warnings }) => warnings)
        .filter(({ rule }) => rule === 'no-unknown-custom-properties')
    ).toHaveLength(count);
  }
});

import { createServer } from 'node:http';
import { readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, extname, dirname } from 'node:path';
import { createRequire } from 'node:module';
import process from 'node:process';
import console from 'node:console';
import lighthouse from 'lighthouse';
const require = createRequire(import.meta.url);
const chromeLauncher = await import(
  require.resolve('chrome-launcher', {
    paths: [dirname(require.resolve('lighthouse'))],
  })
);
const root = resolve('dist');
const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};
const server = createServer((req, res) => {
  try {
    let file = resolve(root, '.' + decodeURI((req.url ?? '/').split('?')[0]));
    if (statSync(file).isDirectory()) file = resolve(file, 'index.html');
    res.setHeader(
      'Content-Type',
      mime[extname(file)] ?? 'application/octet-stream'
    );
    res.end(readFileSync(file));
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
});
await new Promise((done) => server.listen(4325, '127.0.0.1', done));
const out = process.env.LIGHTHOUSE_OUTPUT ?? '/tmp/entif-lighthouse';
mkdirSync(out, { recursive: true });
const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless', '--disable-features=HttpsUpgrades'],
});
try {
  for (const [name, path] of [
    ['home', '/'],
    ['cost', '/tags/research/2026/09/06/the-cost-of-learning-too-late/'],
    ['inflection', '/tags/research/2026/09/07/after-the-inflection/'],
    [
      'etr-opening',
      '/articles/accelerating-the-dystopia/01-the-problem-is-the-substrate/',
    ],
    ['etr-references', '/articles/accelerating-the-dystopia/17-citations/'],
  ]) {
    for (const mode of ['mobile', 'desktop']) {
      const result = await lighthouse('http://127.0.0.1:4325' + path, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
        ...(mode === 'desktop' ? { preset: 'desktop' } : {}),
      });
      if (result.lhr.runtimeError)
        throw new Error(JSON.stringify(result.lhr.runtimeError));
      writeFileSync(
        resolve(out, `${name}-${mode}.json`),
        JSON.stringify(result.lhr, null, 2)
      );
      console.log(
        name,
        mode,
        JSON.stringify(
          Object.fromEntries(
            Object.entries(result.lhr.categories).map(([k, v]) => [
              k,
              Math.round(v.score * 100),
            ])
          )
        )
      );
    }
  }
} finally {
  await chrome.kill();
  server.close();
}

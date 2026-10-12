import console from 'node:console';
import process from 'node:process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { HtmlValidate } from 'html-validate';
import { JSDOM } from 'jsdom';
const root = resolve('dist');
const files = readdirSync(root, { recursive: true }).filter((p) =>
  p.endsWith('.html')
);
const validator = new HtmlValidate({
  extends: ['html-validate:standard'],
  rules: { 'void-style': 'off', 'attr-quotes': 'off' },
});
let errors = 0;
const fragmentIds = new Map();
const readFragmentIds = (path) => {
  if (!fragmentIds.has(path)) {
    const dom = new JSDOM(readFileSync(path, 'utf8'));
    fragmentIds.set(
      path,
      new Set(
        Array.from(
          dom.window.document.querySelectorAll('[id]'),
          (element) => element.id
        )
      )
    );
    dom.window.close();
  }
  return fragmentIds.get(path);
};
for (const file of files) {
  const path = resolve(root, file);
  const source = readFileSync(path, 'utf8');
  const report = await validator.validateString(source, path);
  if (!report.valid) {
    errors++;
    console.error(
      file,
      report.results.flatMap((r) =>
        r.messages.map((m) => `${m.line}: ${m.ruleId}: ${m.message}`)
      )
    );
  }
  const dom = new JSDOM(source);
  const document = dom.window.document;
  const ids = new Set();
  for (const el of document.querySelectorAll('[id]')) {
    if (ids.has(el.id)) {
      errors++;
      console.error(file, 'Duplicate ID', el.id);
    }
    ids.add(el.id);
  }
  fragmentIds.set(path, ids);
  for (const el of document.querySelectorAll(
    'a[href],img[src],script[src],link[href]'
  )) {
    const value = el.getAttribute('href') ?? el.getAttribute('src');
    if (!value || /^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
    const [target, hash] = value.split('#');
    let dest = target
      ? target.startsWith('/')
        ? resolve(root, '.' + decodeURI(target))
        : resolve(dirname(path), decodeURI(target))
      : path;
    if (dest.endsWith('/') || !/\.[a-z0-9]+$/i.test(dest))
      dest = resolve(dest, 'index.html');
    if (!existsSync(dest)) {
      errors++;
      console.error(file, 'Broken local asset/link', value);
      continue;
    }
    if (hash && dest.endsWith('.html')) {
      if (!readFragmentIds(dest).has(decodeURIComponent(hash))) {
        errors++;
        console.error(file, 'Missing fragment', value);
      }
    }
  }
  dom.window.close();
}
if (errors) process.exitCode = 1;
else
  console.log(
    `Validated HTML, duplicate IDs, local links, assets, and fragments across ${files.length} pages.`
  );

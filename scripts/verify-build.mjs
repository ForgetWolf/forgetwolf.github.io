import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import assert from 'node:assert/strict';
import { site } from '../src/site.ts';
const origin = new URL(site.url).origin;
const dist = resolve('dist');
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(resolve(directory, entry.name)) : resolve(directory, entry.name)))).flat();
}
async function exists(path) { try { return (await stat(path)).isFile(); } catch { return false; } }
async function localTarget(url) {
  const path = resolve(dist, '.' + decodeURIComponent(url.pathname));
  assert(path.startsWith(dist), `Invalid local URL: ${url}`);
  return await exists(path) || await exists(resolve(path, 'index.html'));
}
const htmlFiles = (await files(dist)).filter(file => file.endsWith('.html'));
let links = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const pathname = '/' + relative(dist, file).replaceAll('\\', '/').replace(/index\.html$/, '');
  assert(!html.includes('google-analytics.com'), `Analytics unexpectedly enabled: ${pathname}`);
  assert(!html.includes('legacy/'), `Backup published: ${pathname}`);
  assert(!html.includes('fonts.googleapis.com'), `External font request: ${pathname}`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), origin + pathname);
    if (url.origin !== origin) continue;
    assert(await localTarget(url), `Broken local link: ${pathname} -> ${url.pathname}`);
    links++;
  }
}
const sources = (await files(resolve('src/content/posts'))).filter(file => file.endsWith('.md'));
assert.equal(sources.length, 7);
for (const file of sources) {
  const text = await readFile(file, 'utf8');
  assert(!/<\/?[a-z][^>]*>/i.test(text), `HTML remains in article ${file}`);
  const date = /^date: "([^"]+)"/m.exec(text)[1].slice(0, 10).replaceAll('-', '/');
  const slug = JSON.parse(/^slug: (.+)$/m.exec(text)[1]);
  assert(await exists(resolve(dist, date, slug, 'index.html')), `Missing permalink: ${slug}`);
}
const oldPublic = resolve('../public');
const oldPages = (await files(oldPublic)).filter(file => file.endsWith('.html') && !relative(oldPublic, file).startsWith('images'));
for (const oldPage of oldPages) assert(await exists(resolve(dist, relative(oldPublic, oldPage))), `Old URL lost: ${relative(oldPublic, oldPage)}`);
const feed = await readFile(resolve(dist, 'atom.xml'), 'utf8');
assert.equal((feed.match(/<entry>/g) ?? []).length, 7);
assert(feed.includes('2024-12-31T16:54:26.000Z'), 'Taipei date conversion changed');
assert(await exists(resolve(dist, 'licenses/Typography-MIT.txt')));
console.log(`Verified ${sources.length} articles, ${htmlFiles.length} HTML pages, ${links} local links, ${oldPages.length} old URLs, Atom dates and backup isolation.`);

import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const origin = 'https://forgetwolf.github.io';
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'");
const read = path => readFile(resolve('dist', path), 'utf8');
const robots = await read('robots.txt');
assert(robots.includes('Allow: /')); assert(!robots.includes('Disallow: /random'));
assert(robots.includes(`${origin}/sitemap-index.xml`));
const locations = xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => decode(match[1]));
const maps = locations(await read('sitemap-index.xml'));
const urls = [];
for (const map of maps) urls.push(...locations(await read(new URL(map).pathname.slice(1))));
assert.equal(new Set(urls).size, urls.length);
for (const url of urls) {
  assert.equal(new URL(url).origin, origin);
  const path = decodeURIComponent(new URL(url).pathname);
  assert((await stat(resolve('dist', '.' + path, 'index.html'))).isFile());
}
for (const path of ['/', '/about/', '/archives/', '/tags/']) assert(urls.includes(origin + path));
for (const path of ['/random/', '/categories/', '/archives/2023/', '/404.html']) assert(!urls.includes(origin + path));
const posts = JSON.parse(await read('random-posts.json'));
for (const path of posts) assert(urls.includes(new URL(path, origin).href), `Missing article ${path}`);
function graph(html) {
  const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1); return JSON.parse(scripts[0][1])['@graph'];
}
const home = graph(await read('index.html'));
assert(home.some(item => item['@type'] === 'WebSite')); assert(!home.some(item => item['@type'] === 'BlogPosting'));
const profile = graph(await read('about/index.html'));
const person = profile.find(item => item['@type'] === 'Person');
assert.equal(profile.find(item => item['@type'] === 'ProfilePage').mainEntity['@id'], person['@id']);
for (const path of posts) {
  const data = graph(await read(decodeURIComponent(path).slice(1) + 'index.html'));
  const article = data.find(item => item['@type'] === 'BlogPosting');
  assert.equal(article.url, new URL(path, origin).href);
  assert.equal(article.author['@id'], person['@id']);
  assert(Number.isFinite(Date.parse(article.datePublished)));
  assert(!article.image);
}
const random = await read('random/index.html');
assert(random.includes('noindex, follow')); assert(!random.includes('application/ld+json'));
console.log(`Verified ${urls.length} sitemap URLs, ${posts.length} article graphs, homepage/profile graphs, robots and noindex.`);

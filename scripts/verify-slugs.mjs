import { writeFile, readFile, unlink, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const slugs = ['中文 空格', 'a+b=c;d,@$', '[notes]', 'café'];
const created = [];
const build = () => execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { stdio: 'pipe' });
try {
  for (const [index, slug] of slugs.entries()) {
    const file = `src/content/posts/__slug_fixture_${index}.md`;
    await writeFile(file, `---\ntitle: Slug fixture ${index}\ndate: "2026-10-30 12:00:00"\nslug: ${JSON.stringify(slug)}\ntags: [随记]\n---\n\nSlug fixture.\n`, { flag: 'wx' });
    created.push(file);
  }
  build();
  const index = JSON.parse(await readFile('dist/random-posts.json', 'utf8'));
  const feed = await readFile('dist/atom.xml', 'utf8');
  const archive = await readFile('dist/archives/index.html', 'utf8');
  for (const slug of slugs) {
    assert((await stat(`dist/2026/10/30/${slug}/index.html`)).isFile());
    const path = index.find(path => decodeURIComponent(new URL(path, 'https://example.com').pathname) === `/2026/10/30/${slug}/`);
    assert(path, `Missing random index path: ${slug}`);
    const escaped = path.replaceAll('&', '&amp;');
    assert(archive.includes(escaped), `Missing archive link: ${slug}`);
    assert(feed.includes(escaped), `Missing feed link: ${slug}`);
    assert.equal(new URL(path, 'https://example.com').hash, '');
    assert.equal(new URL(path, 'https://example.com').search, '');
  }
  assert((await stat('dist/2023/06/22/I&MIX/index.html')).isFile());
  console.log('Unicode, spaces, path punctuation and legacy filename outputs match archive/feed/random links.');
} finally {
  await Promise.all(created.map(file => unlink(file)));
  build();
}

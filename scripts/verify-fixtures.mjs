// Integration checks for behavior not exercised by the seven original articles.
// Run with Node after installing dependencies. Test files are removed in finally.
import { writeFile, readFile, unlink, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const created = [];
const build = () => execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { stdio: 'pipe' });
try {
  for (let index = 0; index < 9; index++) {
    const file = `src/content/posts/__migration_fixture_${index}.md`;
    const body = `---\ntitle: Fixture ${index}\ndate: "2026-10-29 00:15:00"\nslug: fixture-${index}\ntags: [随记]\ncategories: [迁移验证]\ndraft: ${index === 8}\n---\n\n\`\`\`js\nconst greeting = "hello";\nconsole.log(greeting);\n\`\`\`\n`;
    await writeFile(file, body + '\nNO_DESC_BODY_SHOULD_NOT_BECOME_SUMMARY\n', { flag: 'wx' }); created.push(file);
  }
  build();
  assert((await readFile('dist/page/2/index.html', 'utf8')).includes('上一页'));
  assert((await readFile('dist/tags/随记/page/2/index.html', 'utf8')).includes('上一页'));
  assert((await readFile('dist/categories/迁移验证/index.html', 'utf8')).includes('Fixture 0'));
  const article = await readFile('dist/2026/10/29/fixture-0/index.html', 'utf8');
  assert(article.includes('astro-code')); assert(article.includes('--shiki-dark')); assert(article.includes('class="line"'));
  assert(article.includes('2026-10-28T16:15:00.000Z'));
  const description = /<meta name="description"[^>]*>/.exec(article)?.[0];
  assert(description);
  assert(!/content="[^"]+"/.test(description));
  assert(article.includes('NO_DESC_BODY_SHOULD_NOT_BECOME_SUMMARY'));
  const home = await readFile('dist/index.html', 'utf8');
  assert(!home.includes('NO_DESC_BODY_SHOULD_NOT_BECOME_SUMMARY'));
  const feed = await readFile('dist/atom.xml', 'utf8');
  assert(!feed.includes('NO_DESC_BODY_SHOULD_NOT_BECOME_SUMMARY'));
  assert(feed.includes('<summary></summary>'));
  const random = await readFile('dist/random/index.html', 'utf8');
  assert(random.includes('name="robots" content="noindex, follow"'));
  assert(!home.includes('name="robots" content="noindex'));
  const sitemap = await readFile('dist/sitemap-0.xml', 'utf8');
  assert(sitemap.includes('/categories/</loc>'));
  assert(!sitemap.includes('/page/2/'));
  assert(!sitemap.includes('/fixture-8/'));
  assert(!home.includes('Fixture 8'));
  await assert.rejects(stat('dist/2026/10/29/fixture-8/index.html'));
  console.log('Pagination, tag pagination, categories, Shiki dual themes, Taipei dates and draft exclusion passed.');
} finally {
  await Promise.all(created.map(file => unlink(file)));
  build(); // Restore the real site, including when assertions fail.
}

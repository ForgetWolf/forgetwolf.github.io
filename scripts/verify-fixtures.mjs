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
    await writeFile(file, body, { flag: 'wx' }); created.push(file);
  }
  build();
  assert((await readFile('dist/page/2/index.html', 'utf8')).includes('上一页'));
  assert((await readFile('dist/tags/随记/page/2/index.html', 'utf8')).includes('上一页'));
  assert((await readFile('dist/categories/迁移验证/index.html', 'utf8')).includes('Fixture 0'));
  const article = await readFile('dist/2026/10/29/fixture-0/index.html', 'utf8');
  assert(article.includes('astro-code')); assert(article.includes('--shiki-dark')); assert(article.includes('class="line"'));
  assert(article.includes('2026-10-28T16:15:00.000Z'));
  const home = await readFile('dist/index.html', 'utf8');
  assert(!home.includes('Fixture 8'));
  await assert.rejects(stat('dist/2026/10/29/fixture-8/index.html'));
  console.log('Pagination, tag pagination, categories, Shiki dual themes, Taipei dates and draft exclusion passed.');
} finally {
  await Promise.all(created.map(file => unlink(file)));
  build(); // Restore the real site, including when assertions fail.
}

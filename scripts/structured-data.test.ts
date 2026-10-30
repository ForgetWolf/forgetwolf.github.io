import { articleData, profileData, serializeStructuredData } from '../src/lib/structured-data.ts';
import { createSitemapPolicy } from './sitemap-policy.mjs';
function assert(value: unknown, message = 'Assertion failed') { if (!value) throw new Error(message); }
Deno.test('article JSON-LD uses explicit metadata, no invented summary/date/image', () => {
  const data = articleData({ title: '</script><script>alert("x")</script> 👋', date: '2025-01-01 00:54:26', tags: [] }, '/2025/01/01/test/');
  const encoded = serializeStructuredData(data);
  assert(!encoded.includes('<'));
  const graph = JSON.parse(encoded)['@graph'];
  const post = graph.find((item: Record<string, unknown>) => item['@type'] === 'BlogPosting');
  assert(post.headline === '</script><script>alert("x")</script> 👋');
  assert(post.datePublished === '2024-12-31T16:54:26.000Z');
  assert(!('description' in post) && !('dateModified' in post) && !('image' in post));
});
Deno.test('explicit modification time and description are preserved', () => {
  const data = articleData({ title: 'Post', date: '2025-01-01', updated: '2025-01-02', desc: '手写摘要', tags: ['随记'] }, '/post/');
  const graph = data['@graph'] as Record<string, unknown>[];
  const post = graph.find(item => item['@type'] === 'BlogPosting')!;
  assert(post.description === '手写摘要'); assert(post.dateModified === '2025-01-01T16:00:00.000Z');
  const profile = profileData('关于我')['@graph'] as Record<string, unknown>[];
  assert(JSON.stringify(post.author) === JSON.stringify(profile.find(item => item['@type'] === 'ProfilePage')!.mainEntity));
});
Deno.test('sitemap excludes thin pages and detects nonempty taxonomy indexes', () => {
  const policy = createSitemapPolicy();
  policy.integration.hooks['astro:build:done']({ pages: [{ pathname: 'tags/随记/' }] });
  const url = (path: string) => `https://example.com${path}`;
  assert(policy.filter(url('/tags/'))); assert(!policy.filter(url('/categories/')));
  for (const path of ['/random/', '/404.html', '/random-posts.json', '/page/2/', '/archives/2025/', '/tags/随记/page/2/']) assert(!policy.filter(url(path)));
  policy.integration.hooks['astro:build:done']({ pages: [{ pathname: 'categories/测试/' }] });
  assert(policy.filter(url('/categories/')));
});

import { articleSlug, encodeArticleSlug, isValidArticleSlug } from '../src/lib/slug.ts';
function equal(a: unknown, b: unknown) { if (a !== b) throw new Error(`Expected ${b}, got ${a}`); }
Deno.test('legacy names and path punctuation remain stable', () => {
  equal(encodeArticleSlug('I&MIX'), 'I&MIX');
  equal(encodeArticleSlug('Hello'), 'Hello');
  equal(encodeArticleSlug('a+b=c;d,@$'), 'a+b=c;d,@$');
});
Deno.test('spaces and Unicode round-trip exactly once', () => {
  for (const slug of ['中文 空格', '[notes]', "it's", 'café']) {
    equal(decodeURIComponent(encodeArticleSlug(slug)), slug);
    equal(new URL('/2026/10/30/' + encodeArticleSlug(slug) + '/', 'https://example.com').search, '');
  }
  equal(articleSlug('cafe\u0301'), 'café');
});
Deno.test('unsafe slugs fail rather than silently changing the permalink', () => {
  for (const slug of ['', '.', '..', 'a#b', 'a?b', '100%', 'literal%20name', 'a/b', 'a\\b', 'a:b', 'CON', 'nul.txt', 'trailing.', 'trailing ', 'a\nb']) {
    equal(isValidArticleSlug(slug), false);
    let threw = false;
    try { encodeArticleSlug(slug); } catch { threw = true; }
    equal(threw, true);
  }
});

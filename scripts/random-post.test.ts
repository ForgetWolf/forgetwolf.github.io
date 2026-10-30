import { chooseRandomPost, normalizePath } from '../src/lib/random-post.ts';

function equal(actual: unknown, expected: unknown) {
  if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);
}
Deno.test('same article: encoded name, index.html, query and fragment', () => {
  const current = '/2023/06/22/I%26MIX/index.html?from=nav#section';
  equal(normalizePath(current), '/2023/06/22/I&MIX');
  equal(chooseRandomPost(['/2023/06/22/I&MIX/', '/other/'], current, () => 0), '/other/');
});
Deno.test('empty index and only current article have no destination', () => {
  equal(chooseRandomPost([], '/current/'), null);
  equal(chooseRandomPost(['/current/', '/current/index.html'], '/current/'), null);
});
Deno.test('duplicates and external paths cannot become destinations', () => {
  equal(chooseRandomPost(['//other.test/', '/\\other.test/', '/next/', '/next/index.html'], '/current/', () => 0.99), '/next/');
});
Deno.test('selection scales with the built index, without a fixed article limit', () => {
  const paths = Array.from({ length: 10000 }, (_, index) => `/post-${index}/`);
  equal(chooseRandomPost(paths, '/post-0/', () => 0), '/post-1/');
  equal(chooseRandomPost(paths, '/post-0/', () => 0.999999), '/post-9999/');
});

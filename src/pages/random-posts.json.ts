import { allPosts, postPath } from '../lib/posts';

// One shared index, independent of article count; never embed it into every page.
export async function GET() {
  const paths = (await allPosts()).map(postPath);
  return new Response(JSON.stringify(paths), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

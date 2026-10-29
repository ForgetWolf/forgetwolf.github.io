import { allPosts, excerpt, postPath, timestamp } from '../lib/posts';
import { site } from '../site';
const xml = (value: string) => value.replace(/[<>&"']/g, ch => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[ch]!);
export async function GET() {
  const posts = (await allPosts()).slice(0, 20);
  const iso = (date: string) => new Date(timestamp(date)).toISOString();
  const latest = posts.reduce((value, post) => Math.max(value, timestamp(post.data.updated ?? post.data.date)), 0);
  const output = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-CN">
<title>${xml(site.title)}</title><subtitle>${xml(site.description)}</subtitle>
<id>${site.url}/</id><link href="${site.url}/"/><link href="${site.url}/atom.xml" rel="self"/>
<updated>${new Date(latest).toISOString()}</updated><author><name>${xml(site.author)}</name></author>
${posts.map(post => { const url = new URL(postPath(post), site.url).href; return `<entry><title>${xml(post.data.title)}</title><id>${xml(url)}</id><link href="${xml(url)}"/><published>${iso(post.data.date)}</published><updated>${iso(post.data.updated ?? post.data.date)}</updated><summary>${xml(excerpt(post))}</summary>${post.data.tags.map(tag => `<category term="${xml(tag)}"/>`).join('')}</entry>`; }).join('\n')}
</feed>`;
  return new Response(output, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
}

import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../site';

export type Post = CollectionEntry<'posts'>;
export function timestamp(value: string): number {
  const normalized = value.trim().replace(' ', 'T');
  const withZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized) ? normalized : normalized + '+08:00';
  const result = Date.parse(withZone);
  if (!Number.isFinite(result)) throw new Error(`Invalid article date: ${value}`);
  return result;
}
export function dateLabel(value: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: site.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(timestamp(value));
  const part = (key: string) => parts.find(p => p.type === key)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function postPath(post: Post): string {
  return `/${dateLabel(post.data.date).replaceAll('-', '/')}/${encodeURI(post.data.slug)}/`;
}
export function termPath(kind: 'tags' | 'categories', name: string): string {
  return `/${kind}/${encodeURIComponent(name)}/`;
}
export async function allPosts(): Promise<Post[]> {
  return (await getCollection('posts', p => !p.data.draft)).sort((a, b) =>
    timestamp(b.data.date) - timestamp(a.data.date) || a.data.slug.localeCompare(b.data.slug));
}
export function terms(posts: Post[], kind: 'tags' | 'categories'): string[] {
  return [...new Set(posts.flatMap(post => post.data[kind]))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
}
export function excerpt(post: Post): string {
  return post.data.desc ?? (post.body ?? '').replace(/```[\s\S]*?```/g, '').replace(/[#*_~`]/g, '').trim().slice(0, 160);
}

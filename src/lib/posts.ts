import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../site';
import { encodeArticleSlug } from './slug';
import { parseArticleDate } from './article-date';
import { manualSummary } from './summary';

export type Post = CollectionEntry<'posts'>;
export function timestamp(value: string): number {
  return parseArticleDate(value, site.timezone);
}
export function dateLabel(value: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: site.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(timestamp(value));
  const part = (key: string) => parts.find(p => p.type === key)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function postPath(post: Post): string {
  return `/${dateLabel(post.data.date).replaceAll('-', '/')}/${encodeArticleSlug(post.data.slug)}/`;
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
  return manualSummary(post.data.desc);
}

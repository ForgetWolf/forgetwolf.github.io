import { site } from '../site';
import { parseArticleDate } from './article-date';

export type StructuredData = Record<string, unknown>;
const absolute = (path: string) => new URL(path, site.url).href;
const authorId = absolute('/about/#person');
const websiteId = absolute('/#website');
function graph(extra: StructuredData[] = []): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Person', '@id': authorId, name: site.author, url: absolute('/about/'),
        sameAs: site.social.filter(link => link.url.startsWith('https://')).map(link => link.url) },
      { '@type': 'WebSite', '@id': websiteId, url: absolute('/'), name: site.title,
        description: site.description, inLanguage: 'zh-CN', author: { '@id': authorId } },
      ...extra,
    ],
  };
}
export const websiteData = () => graph();
export function articleData(data: { title: string; date: string; updated?: string; desc?: string; tags: string[] }, path: string): StructuredData {
  const url = absolute(path);
  const iso = (date: string) => new Date(parseArticleDate(date, site.timezone)).toISOString();
  return graph([{
    '@type': 'BlogPosting', '@id': `${url}#article`, url, headline: data.title,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@id': websiteId }, author: { '@id': authorId }, inLanguage: 'zh-CN',
    datePublished: iso(data.date),
    ...(data.updated ? { dateModified: iso(data.updated) } : {}),
    ...(data.desc ? { description: data.desc } : {}),
    ...(data.tags.length ? { keywords: data.tags } : {}),
  }]);
}
export function profileData(title: string, description?: string): StructuredData {
  return graph([{
    '@type': 'ProfilePage', '@id': absolute('/about/#profile'), url: absolute('/about/'),
    name: title, mainEntity: { '@id': authorId }, isPartOf: { '@id': websiteId },
    ...(description ? { description } : {}),
  }]);
}
export function serializeStructuredData(data: StructuredData): string {
  // Escape HTML-sensitive characters before inserting JSON into a script element.
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, character =>
    `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

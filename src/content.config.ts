import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { isValidArticleSlug } from './lib/slug';
import { parseArticleDate } from './lib/article-date';
import { site } from './site';

const articleDate = z.union([z.string(), z.date()]).transform((value, context) => {
  try {
    parseArticleDate(value, site.timezone);
    // YAML date objects are already instants. Preserve them as portable ISO strings.
    return value instanceof Date ? value.toISOString() : value;
  } catch (error) {
    context.addIssue({ code: 'custom', message: error instanceof Error ? error.message : String(error) });
    return z.NEVER;
  }
});

const metadata = z.object({
  title: z.string(),
  date: articleDate,
  updated: articleDate.optional(),
  desc: z.string().optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export const collections = {
  posts: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
    schema: metadata.extend({ slug: z.string().refine(isValidArticleSlug, 'slug 必须是单个可移植目录名，不能包含 #、?、%、路径分隔符或保留文件名字符，也不能以空格或句点结尾。') }),
  }),
  pages: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content' }),
    schema: metadata,
  }),
};

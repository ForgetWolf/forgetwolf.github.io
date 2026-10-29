import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const metadata = z.object({
  title: z.string(),
  date: z.string(),
  updated: z.string().optional(),
  desc: z.string().optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export const collections = {
  posts: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
    schema: metadata.extend({ slug: z.string() }),
  }),
  pages: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content' }),
    schema: metadata,
  }),
};

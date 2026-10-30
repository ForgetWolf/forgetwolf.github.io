// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './src/site.ts';
import { createSitemapPolicy } from './scripts/sitemap-policy.mjs';

const sitemapPolicy = createSitemapPolicy();

// https://astro.build/config
export default defineConfig({
  site: site.url,
  integrations: [sitemapPolicy.integration, sitemap({ filter: sitemapPolicy.filter })],
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: { themes: { light: 'github-light', dark: 'nord' } },
  },
});

import { site } from '../site';

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site.url).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// Use generated routes to detect whether taxonomy indexes contain any terms.
// Never infer publication/modified dates from the build time.
export function createSitemapPolicy() {
  let routes = [];
  return {
    integration: {
      name: 'content-sitemap-policy',
      hooks: {
        'astro:build:done': ({ pages }) => { routes = pages.map(page => '/' + page.pathname.replace(/^\/+/, '')); },
      },
    },
    filter(url) {
      const path = new URL(url).pathname;
      if (['/', '/about/', '/archives/'].includes(path)) return true;
      if (/^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/.test(path)) return true;
      if (/^\/(tags|categories)\/[^/]+\/$/.test(path)) return true;
      if (path === '/tags/' || path === '/categories/') {
        return routes.some(route => route.startsWith(path) && /^\/(tags|categories)\/[^/]+\/$/.test(route));
      }
      return false;
    },
  };
}

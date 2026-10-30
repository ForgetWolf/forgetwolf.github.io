import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const { chromium } = createRequire(process.argv[2] + '/package.json')('playwright');
const base = process.argv[3] ?? 'http://127.0.0.1:4323';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  let requests = 0;
  page.on('request', request => { if (new URL(request.url()).pathname === '/random-posts.json') requests++; });
  await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(requests, 0, 'Article index must not load until requested');
  const labels = await page.locator('#site-nav > ul > li > a').allTextContents();
  assert(labels.indexOf('偏航') > labels.indexOf('标签'));
  assert(labels.indexOf('偏航') < labels.indexOf('关于我'));
  await Promise.all([page.waitForURL(url => /\/\d{4}\/\d{2}\/\d{2}\//.test(url.pathname)), page.locator('[data-random-link]').click()]);
  await page.waitForLoadState('networkidle');
  assert.equal(requests, 1);
  for (const path of ['/2023/06/22/I%26MIX/', '/2023/06/22/I%26MIX/index.html']) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await Promise.all([page.waitForURL(url => !decodeURIComponent(url.pathname).includes('I&MIX')), page.locator('[data-random-link]').click()]);
    assert(/\/\d{4}\/\d{2}\/\d{2}\//.test(new URL(page.url()).pathname));
  }
  await page.goto(base + '/random/', { waitUntil: 'networkidle' });
  await page.waitForURL(url => /\/\d{4}\/\d{2}\/\d{2}\//.test(url.pathname));
  await page.route('**/random-posts.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.goto(base + '/random/', { waitUntil: 'networkidle' });
  assert.match(await page.locator('#random-status').textContent(), /暂时无法/);
  assert(await page.locator('main a[href="/archives/"]').isVisible());
  console.log('Lazy index, navigation order, random destination, current/encoded/index.html exclusion, direct entry and empty-index fallback passed.');
} finally { await browser.close(); }

import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(process.argv[2] + '/package.json');
const { chromium } = require('playwright');
const base = process.argv[3] ?? 'http://127.0.0.1:4322';
await mkdir('verification', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', colorScheme: 'light' });
  // A saved choice from the former manual toggle must no longer override the system.
  await context.addInitScript(() => localStorage.setItem('typography-theme', 'dark'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const fontLoaded = await page.evaluate(() => [...document.fonts].some(font => font.family === 'Gentium' && font.status === 'loaded'));
  assert(fontLoaded, 'Gentium webfont did not load');
  await page.evaluate(() => {
    const sample = document.createElement('span'); sample.id = 'glyph-check'; sample.textContent = 'g';
    sample.style.cssText = 'position:fixed;left:0;top:0;font:100px Gentium;background:white;color:black;font-feature-settings:"ss12" 0;z-index:100';
    document.body.append(sample);
  });
  const normalG = await page.locator('#glyph-check').screenshot();
  await page.locator('#glyph-check').evaluate(element => element.style.fontFeatureSettings = '"ss12" 1');
  const alternateG = await page.locator('#glyph-check').screenshot();
  assert(!normalG.equals(alternateG), 'Gentium single-storey g feature did not change the rendered glyph');
  await page.locator('#glyph-check').evaluate(element => element.remove());
  assert.equal(await page.locator('main article').count(), 7);
  const inspect = async () => page.evaluate(() => {
    const main = document.querySelector('main').getBoundingClientRect();
    const side = document.querySelector('aside').getBoundingClientRect();
    return { width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth,
      main: { x: main.x, y: main.y, right: main.right }, side: { x: side.x, y: side.y, bottom: side.bottom },
      color: getComputedStyle(document.querySelector('main p')).color,
      font: getComputedStyle(document.querySelector('main p')).fontFamily,
      background: getComputedStyle(document.body).backgroundColor };
  });
  let state = await inspect();
  assert(!state.overflow); assert(state.main.right <= state.side.x + 1);
  assert(await page.locator('#theme-toggle').isVisible());
  assert.equal(state.color, 'rgb(76, 110, 134)');
  assert.equal(state.background, 'rgb(252, 250, 242)');
  await page.screenshot({ path: 'verification/home-light.png', fullPage: true });
  console.log('desktop light', state);
  // Click opposite the system: persist a manual choice, even if the system later matches it.
  await page.locator('#theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  assert.equal(await page.evaluate(() => localStorage.getItem('typography-color-mode')), 'dark');
  await page.emulateMedia({ colorScheme: 'dark' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  state = await inspect(); assert.equal(state.color, 'rgb(255, 255, 255)');
  assert.equal(state.background, 'rgb(46, 64, 91)');
  await page.screenshot({ path: 'verification/home-dark.png', fullPage: true });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal((await inspect()).color, 'rgb(255, 255, 255)');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  assert.equal((await inspect()).color, 'rgb(255, 255, 255)');
  await page.locator('#theme-toggle').click();
  assert.equal(await page.evaluate(() => localStorage.getItem('typography-color-mode')), 'auto');
  assert.equal(await page.locator('html').getAttribute('data-theme'), null);
  await page.emulateMedia({ colorScheme: 'dark' });
  assert.equal((await inspect()).color, 'rgb(255, 255, 255)');
  await page.locator('#theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
  assert(!(await page.locator('#theme-toggle').isVisible()));
  assert.equal(await page.locator('html').getAttribute('data-theme'), null);
  assert.equal((await inspect()).color, 'rgb(255, 255, 255)');
  await page.emulateMedia({ colorScheme: 'light' });
  state = await inspect(); assert(!state.overflow); assert(state.main.y >= state.side.bottom - 1);
  await page.screenshot({ path: 'verification/mobile-light.png', fullPage: true });
  console.log('mobile light', state);
  await page.goto(`${base}/2023/06/22/I%26MIX/`, { waitUntil: 'networkidle' });
  assert.match(await page.locator('main h1').textContent(), /mix2s/);
  assert.equal(await page.locator('main u').count(), 0);
  await page.screenshot({ path: 'verification/article-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1024, height: 550 });
  await page.waitForFunction(() => document.querySelector('main').getBoundingClientRect().top >= document.querySelector('aside').getBoundingClientRect().bottom - 1);
  state = await inspect(); assert(!state.overflow); assert(state.main.y >= state.side.bottom - 1);
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' });
  const staticPage = await noJs.newPage(); await staticPage.goto(base, { waitUntil: 'domcontentloaded' });
  assert(await staticPage.locator('main article').first().isVisible());
  assert.equal(await staticPage.locator('body').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(46, 64, 91)');
  assert(!(await staticPage.locator('#theme-toggle').isVisible()));
  // Wide touch devices (e.g. landscape tablets) also stay auto, regardless of saved desktop choice.
  const touch = await browser.newContext({ hasTouch: true, viewport: { width: 1024, height: 768 }, colorScheme: 'dark' });
  await touch.addInitScript(() => localStorage.setItem('typography-color-mode', 'light'));
  const touchPage = await touch.newPage(); await touchPage.goto(base, { waitUntil: 'networkidle' });
  assert(!(await touchPage.locator('#theme-toggle').isVisible()));
  assert.equal(await touchPage.locator('html').getAttribute('data-theme'), null);
  assert.equal(await touchPage.locator('body').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(46, 64, 91)');
  assert.deepEqual(errors, []);
  console.log('Desktop auto/manual cycle, persistence across matching system changes, mobile/touch auto-only, no-JS dark mode and runtime/network checks passed.');
} finally { await browser.close(); }

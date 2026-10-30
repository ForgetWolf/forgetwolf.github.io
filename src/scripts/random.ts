import { chooseRandomPost } from '../lib/random-post';

let indexRequest: Promise<string[]> | undefined;
let navigating = false;
function loadIndex(): Promise<string[]> {
  if (!indexRequest) {
    indexRequest = fetch('/random-posts.json', { cache: 'no-cache' })
      .then(async response => {
        if (!response.ok) throw new Error('Unable to load article index');
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every(path => typeof path === 'string')) throw new Error('Invalid article index');
        return data as string[];
      })
      .catch(error => { indexRequest = undefined; throw error; });
  }
  return indexRequest;
}
async function navigate(current: string, landing: boolean) {
  if (navigating) return;
  navigating = true;
  const link = document.querySelector<HTMLAnchorElement>('[data-random-link]');
  link?.setAttribute('aria-busy', 'true');
  try {
    const target = chooseRandomPost(await loadIndex(), current);
    if (!target) throw new Error('No other published articles');
    if (landing) window.location.replace(target);
    else window.location.assign(target);
  } catch {
    navigating = false;
    link?.removeAttribute('aria-busy');
    if (!landing) { window.location.assign('/random/'); return; }
    const status = document.querySelector<HTMLElement>('[data-random-landing]');
    if (status) status.textContent = '暂时无法选择其他文章，请从归档阅读或稍后再试。';
  }
}
document.querySelector<HTMLAnchorElement>('[data-random-link]')?.addEventListener('click', event => {
  // Preserve new-tab, modified-click and copy-link behavior.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  void navigate(window.location.pathname, false);
});
if (document.querySelector('[data-random-landing]')) {
  let current = window.location.pathname;
  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin) current = referrer.pathname;
  } catch { /* Direct visits have no referrer. */ }
  void navigate(current, true);
}

type Mode = 'auto' | 'light' | 'dark';
const storageKey = 'typography-color-mode';
const system = matchMedia('(prefers-color-scheme: dark)');
const mobile = matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)');
const button = document.querySelector<HTMLButtonElement>('#theme-toggle');
const readMode = (): Mode => {
  try {
    const value = localStorage.getItem(storageKey);
    return value === 'light' || value === 'dark' ? value : 'auto';
  } catch { return 'auto'; }
};
let mode = readMode();
const systemTheme = () => system.matches ? 'dark' : 'light';
const themeName = (theme: string) => theme === 'dark' ? '深色' : '浅色';

function apply() {
  if (mobile.matches || mode === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = mode;
  if (!button) return;
  button.hidden = mobile.matches;
  const current = mode === 'auto' ? systemTheme() : mode;
  const next = current === 'dark' ? 'light' : 'dark';
  const nextMode = next === systemTheme() ? '自动' : '手动';
  const label = `当前：${mode === 'auto' ? '自动' : '手动'}${themeName(current)}；点击切换为${nextMode}${themeName(next)}`;
  button.title = label;
  button.setAttribute('aria-label', label);
}
button?.addEventListener('click', () => {
  if (mobile.matches) return;
  const current = mode === 'auto' ? systemTheme() : mode;
  const next = current === 'dark' ? 'light' : 'dark';
  // Only a click may restore automatic mode; system changes never erase a choice.
  mode = next === systemTheme() ? 'auto' : next;
  try { localStorage.setItem(storageKey, mode); } catch {}
  apply();
});
system.addEventListener('change', apply);
mobile.addEventListener('change', apply);
window.addEventListener('storage', event => {
  if (event.key === storageKey || event.key === null) { mode = readMode(); apply(); }
});
apply();

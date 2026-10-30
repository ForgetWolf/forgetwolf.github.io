export function normalizePath(path: string): string {
  const pathname = new URL(path, 'https://local.invalid').pathname;
  let decoded = pathname;
  try { decoded = decodeURIComponent(pathname); } catch { /* Keep malformed escapes literal. */ }
  return decoded.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';
}

export function chooseRandomPost(paths: string[], current: string, random = Math.random): string | null {
  const currentPath = normalizePath(current);
  const seen = new Set<string>();
  const candidates = paths.filter(path => {
    // The build supplies same-origin absolute paths, never arbitrary redirects.
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return false;
    const normalized = normalizePath(path);
    if (normalized === currentPath || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
  return candidates.length ? candidates[Math.floor(random() * candidates.length)] : null;
}

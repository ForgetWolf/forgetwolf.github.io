// Slugs are one literal directory name, not a URL or an already encoded path.
// Keep them portable across Windows builds and static hosts. Astro sanitizes #/?,
// which otherwise produces a different on-disk directory from the linked URL.
export function isValidArticleSlug(slug: string): boolean {
  return slug.length > 0 && !/[\u0000-\u001f\u007f/\\<>:"|?*#%]/u.test(slug)
    && !/[. ]$/.test(slug) && slug !== '.' && slug !== '..'
    && !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(slug);
}
export function articleSlug(slug: string): string {
  if (!isValidArticleSlug(slug)) throw new Error(`Invalid article slug ${JSON.stringify(slug)}: use a single portable directory name without #, ?, %, slashes or reserved filename characters.`);
  return slug.normalize('NFC');
}
export function encodeArticleSlug(slug: string): string {
  // Preserve legal path-segment punctuation used by old URLs (notably I&MIX).
  // Astro dev decodes with decodeURI, which deliberately keeps these escapes.
  return encodeURIComponent(articleSlug(slug)).replace(/%(?:26|2B|2C|3B|3D|40|24)/gi, escape => decodeURIComponent(escape));
}

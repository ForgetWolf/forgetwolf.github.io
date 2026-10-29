import { mkdir, readFile, writeFile, cp, readdir, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const old = resolve(root, '../themes/typography');
// One-time import only. Never overwrite the preserved migration baseline.
try { await access(resolve(root, 'legacy/hexo-config.yml.bak')); throw new Error('Migration baseline already exists; do not rerun this one-time importer.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const write = async (path, text) => { await mkdir(resolve(root, path, '..'), { recursive: true }); await writeFile(resolve(root, path), text); };
await mkdir(resolve(root, 'legacy/typography'), { recursive: true });
for (const name of ['layout', 'raw', 'source', '_config.yml', 'LICENSE', 'package.json']) {
  await cp(resolve(old, name), resolve(root, 'legacy/typography', name), { recursive: true });
}
await cp(resolve(root, '../_config.yml'), resolve(root, 'legacy/hexo-config.yml.bak'));
await cp(resolve(root, '../source'), resolve(root, 'legacy/content'), { recursive: true });
await mkdir(resolve(root, 'legacy/astro-starter'), { recursive: true });
for (const name of ['src', 'public', 'astro.config.mjs', 'package.json', 'README.md']) {
  await cp(resolve(root, name), resolve(root, 'legacy/astro-starter', name), { recursive: true });
}
await mkdir(resolve(root, 'src/content/posts'), { recursive: true });
for (const name of await readdir(resolve(root, '../source/_posts'))) {
  if (!name.endsWith('.md')) continue;
  let text = await readFile(resolve(root, '../source/_posts', name), 'utf8');
  // Preserve legacy case and punctuation; content collection IDs are not URLs.
  text = text.replace(/^(date: .+)$/m, '$1\nslug: ' + JSON.stringify(name.slice(0, -3)));
  text = text.replace(/\*\*<u>([\s\S]*?)<\/u>\*\*/g, (_, value) => '**' + value.replace(/\r?\n/g, ' ') + '**');
  text = text.replace(/<u>\*\*([\s\S]*?)\*\*<\/u>/g, '**$1**');
  text = text.replace(/<u>([\s\S]*?)<\/u>/g, '**$1**');
  await write('src/content/posts/' + name, text);
}
await cp(resolve(root, '../source/about/index.md'), resolve(root, 'src/content/about.md'));
for (const [from, to] of [['source/fonts', 'public/fonts'], ['source/images/favicon.png', 'public/images/favicon.png'], ['source/css/bootstrap.min.css', 'src/styles/vendor/bootstrap.min.css'], ['source/css/font-awesome.min.css', 'src/styles/vendor/font-awesome.min.css']]) {
  await mkdir(resolve(root, to, '..'), { recursive: true });
  await cp(resolve(old, from), resolve(root, to), { recursive: true });
}
let css = await readFile(resolve(old, 'source/css/style.css'), 'utf8');
css = css.split('/*# sourceMappingURL')[0].replace(/@import[^;]+;/g, '');
// These selectors address Hexo's generated code tables, not Astro/Shiki markup.
css = css.replace(/(?:figure(?:\s*>\s*table|\s+\.gutter\s+pre|\s+\.code(?:\s+pre)?)?|pre\s+\*)\s*\{[^}]*\}/g, '');
css = css.replace(/#FCFAF2/gi, '$background').replace(/#373C38/gi, '$foreground').replace(/#4f5751/gi, 'var(--muted-foreground)');
css = css.replace(/font-family:\s*"Noto Serif SC",serif/g, 'font-family: $font-stack');
// Format the effective CSS into readable SCSS without touching data URLs.
let formatted = '', depth = 0, quote = '', parens = 0;
for (let i = 0; i < css.length; i++) {
  const ch = css[i];
  if (quote) { formatted += ch; if (ch === quote && css[i-1] !== '\\') quote = ''; continue; }
  if (ch === '"' || ch === "'") { quote = ch; formatted += ch; continue; }
  if (ch === '(') parens++; if (ch === ')') parens--;
  if (!parens && ch === '{') { depth++; formatted += ' {\n' + '  '.repeat(depth); }
  else if (!parens && ch === '}') { depth--; formatted = formatted.trimEnd() + '\n' + '  '.repeat(depth) + '}\n' + '  '.repeat(depth); }
  else if (!parens && ch === ';') formatted += ';\n' + '  '.repeat(depth);
  else formatted += ch;
}
await write('src/styles/_typography.scss', '// Effective local CSS, reconciled into SCSS. See legacy/typography for the untouched source.\n$background: var(--background);\n$foreground: var(--foreground);\n$font-stack: "Gentium Plus", "Noto Serif SC", serif;\n\n' + formatted.trim() + '\n');
await write('legacy/highlighting.config.mjs.bak', '// Migration reference only; never imported by the live build.\n// Hexo: prism_plugin: { enable: true, mode: "preprocess", theme: "nord", line_number: true }\n// Hexo markup: figure > table > .gutter / .code (styles preserved in typography/source/css).\n// Replacement: Astro built-in Shiki, configured in astro.config.mjs.\nexport const markdown = { syntaxHighlight: "shiki", shikiConfig: { themes: { light: "github-light", dark: "nord" } } };\n');

import { parseArticleDate } from '../src/lib/article-date.ts';
import { manualSummary } from '../src/lib/summary.ts';
function equal(a: unknown, b: unknown) { if (a !== b) throw new Error(`Expected ${b}, got ${a}`); }
function rejects(value: string, timezone = 'Asia/Taipei') {
  let failed = false;
  try { parseArticleDate(value, timezone); } catch { failed = true; }
  equal(failed, true);
}
Deno.test('legacy local dates, date-only, ISO offsets and Date objects', () => {
  const expected = Date.parse('2024-12-31T16:54:26Z');
  for (const value of ['2025-01-01 00:54:26', '2025-01-01T00:54:26+08:00', '2025-01-01T00:54:26+0800', '2024-12-31T16:54:26Z', new Date(expected)]) {
    equal(parseArticleDate(value, 'Asia/Taipei'), expected);
  }
  equal(parseArticleDate('2025-01-01', 'Asia/Taipei'), Date.parse('2024-12-31T16:00:00Z'));
  equal(parseArticleDate('2025-01-01 00:54', 'Asia/Taipei'), Date.parse('2024-12-31T16:54:00Z'));
});
Deno.test('configured timezone and DST apply instead of hardcoded +08:00', () => {
  equal(parseArticleDate('2025-07-01 12:00:00', 'America/New_York'), Date.parse('2025-07-01T16:00:00Z'));
  equal(parseArticleDate('2025-01-01 12:00:00', 'America/New_York'), Date.parse('2025-01-01T17:00:00Z'));
  equal(parseArticleDate('2025-07-01T12:00:00+08:00', 'America/New_York'), Date.parse('2025-07-01T04:00:00Z'));
  rejects('2025-03-09 02:30:00', 'America/New_York');
  rejects('2025-11-02 01:30:00', 'America/New_York');
});
Deno.test('invalid dates fail instead of rolling into another day', () => {
  equal(parseArticleDate('2024-02-29', 'UTC'), Date.parse('2024-02-29T00:00:00Z'));
  for (const value of ['2025-02-29', '2025-02-31', '2025-13-01', '2025-01-01 24:00:00', '2025-01-01 12:60:00', '2025-01-01 12:00:60', 'not a date', '']) rejects(value);
  rejects('2025-01-01', 'Invalid/Timezone');
});
Deno.test('manual desc only; no automatic text', () => {
  equal(manualSummary(), ''); equal(manualSummary(''), '');
  equal(manualSummary('这是手写摘要 👩‍💻'), '这是手写摘要 👩‍💻');
});

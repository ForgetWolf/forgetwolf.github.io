import { Temporal } from '@js-temporal/polyfill';

// Framework-independent: keep Markdown dates as strings; resolve to an instant
// only when validating/rendering. Explicit offsets always take precedence.
export function parseArticleDate(value: string | Date, timezone: string): number {
  try {
    if (value instanceof Date) {
      if (!Number.isFinite(value.getTime())) throw new Error('Invalid Date');
      return Temporal.Instant.from(value.toISOString()).toZonedDateTimeISO(timezone).epochMilliseconds;
    }
    const match = /^(\d{4}-\d{2}-\d{2})(?:[Tt ](\d{2}):(\d{2})(?::(\d{2})(\.\d{1,9})?)?([Zz]|[+-]\d{2}:?\d{2})?)?$/.exec(value.trim());
    if (!match) throw new Error('Use ISO 8601 or YYYY-MM-DD HH:mm:ss');
    const [, date, hour = '00', minute = '00', second = '00', fraction = '', offset] = match;
    if (+hour > 23 || +minute > 59 || +second > 59) throw new Error('Invalid time');
    const local = Temporal.PlainDateTime.from(`${date}T${hour}:${minute}:${second}${fraction}`);
    if (offset) {
      return Temporal.Instant.from(`${local.toString()}${offset.toUpperCase()}`).toZonedDateTimeISO(timezone).epochMilliseconds;
    }
    // Reject ambiguous/nonexistent daylight-saving wall times: use an explicit
    // ISO offset for these, rather than silently moving the publication time.
    return local.toZonedDateTime(timezone, { disambiguation: 'reject' }).epochMilliseconds;
  } catch (error) {
    throw new Error(`Invalid article date ${JSON.stringify(value)} (${timezone}): ${error instanceof Error ? error.message : String(error)}`);
  }
}

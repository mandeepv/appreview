// The last line of defence for INVARIANTS #8 on the Sentry side: whatever an
// error, a breadcrumb or an `extra` carries, an email address is replaced
// before the event leaves the phone. The rule is still "never report PII"
// (identify by user id, report codes not messages — see authErrorForReport
// in lib/emailOtp.ts); this catches the message nobody knew could hold one,
// like GoTrue's `Email address "…" cannot be used` (web2app review
// 2026-10-07, B-5). Pure, so it is unit-tested without the Sentry SDK.

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

/** `text` with every email address replaced by "[email]". */
export function redactEmails(text: string): string {
  return text.replace(EMAIL, '[email]');
}

/**
 * A copy of `value` with every string inside it redacted, walked to a fixed
 * depth (Sentry events are small; anything deeper is dropped, not leaked).
 * Errors, dates and other class instances keep their identity: only plain
 * objects and arrays are rebuilt.
 */
export function scrubEmails<T>(value: T, depth = 0): T {
  if (typeof value === 'string') return redactEmails(value) as T;
  if (depth > 8 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => scrubEmails(v, depth + 1)) as T;
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = scrubEmails(v, depth + 1);
  return out as T;
}

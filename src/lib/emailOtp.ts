// Email sign-in with a 6-digit code (2026-10) — the pure pieces: address
// normalisation, the shape check, and turning a Supabase auth error into
// plain words shown inline on AuthScreen. No Supabase import, so it is
// unit-testable; the calls live in src/services/authService.ts.
//
// WHY A CODE AND NEVER A MAGIC LINK. A link opens in Safari and leaves the
// parent outside the app, signed in on a web page. A code is typed (or
// autofilled from Mail) where they already are.
//
// WHO IT IS FOR. Organic users get a third sign-up method, but it exists for
// kinderwell.app buyers: the website creates their Supabase user from the
// email they paid with, so signing in here with that same email lands on the
// same user — and the launch gate finds their purchase. Apple's Hide My Email
// cannot do that (it mints a different address, so a different user).

export const OTP_LENGTH = 6;

// Supabase allows one code per address per minute; the Resend button stays
// disabled this long after every send so the parent cannot trip the limit.
export const RESEND_COOLDOWN_SECONDS = 60;

/** What Supabase sees: trimmed and lowercased. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** A shape check to enable Send code — not validation; Supabase decides. */
export function isPlausibleEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(raw));
}

/** The code field accepts digits only, capped at OTP_LENGTH. */
export function sanitizeOtpInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export type EmailOtpErrorKind =
  | 'invalid_code'
  | 'rate_limited'
  | 'network'
  | 'invalid_email'
  | 'unknown';

/**
 * Classify a Supabase auth error by its structural fields (code / status /
 * name), not its message text, which Supabase may reword. Only `unknown` is
 * worth a Sentry report: the rest are a parent mistyping, waiting, or offline.
 * `email_address_not_authorized` deliberately lands in `unknown` — it is what
 * Supabase's built-in mailer returns for anyone outside the project team, so
 * it means custom SMTP is not configured, and that must be loud.
 */
export function classifyEmailOtpError(error: unknown): EmailOtpErrorKind {
  const e = (error ?? {}) as { code?: unknown; status?: unknown; name?: unknown; message?: unknown };
  const code = typeof e.code === 'string' ? e.code : undefined;
  const status = typeof e.status === 'number' ? e.status : undefined;
  const name = typeof e.name === 'string' ? e.name : undefined;
  const message = typeof e.message === 'string' ? e.message : '';

  if (name === 'AuthRetryableFetchError' || /network request failed/i.test(message)) return 'network';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || status === 429) {
    return 'rate_limited';
  }
  if (code === 'otp_expired') return 'invalid_code';
  if (code === 'email_address_invalid' || code === 'validation_failed') return 'invalid_email';
  return 'unknown';
}

/** The inline message for a failed send or verify. Plain words, no codes. */
export function emailOtpErrorMessage(kind: EmailOtpErrorKind, step: 'send' | 'verify'): string {
  switch (kind) {
    case 'network':
      return 'No connection. Check your internet and try again.';
    case 'rate_limited':
      return step === 'send'
        ? 'Too many codes requested. Wait a minute, then try again.'
        : 'Too many attempts. Wait a minute, then send a new code.';
    case 'invalid_code':
      return 'That code is wrong or has expired. Check it, or send a new one.';
    case 'invalid_email':
      // On verify, a validation failure is about the code, not the address.
      return step === 'send'
        ? "That email address doesn't look right."
        : 'That code is wrong or has expired. Check it, or send a new one.';
    case 'unknown':
      return step === 'send'
        ? "We couldn't send a code. Please try again."
        : "We couldn't sign you in. Please try again.";
  }
}

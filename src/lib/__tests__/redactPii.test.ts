// The Sentry-side email scrubber (INVARIANTS #8, web2app review B-5).
import { redactEmails, scrubEmails } from '../redactPii';
import { FIXTURE_EMAIL } from '../../test/factories';

describe('redactEmails', () => {
  it('replaces every address, whatever surrounds it', () => {
    expect(redactEmails(`Email address "${FIXTURE_EMAIL}" cannot be used as it is not authorized`)).toBe(
      'Email address "[email]" cannot be used as it is not authorized',
    );
    expect(redactEmails('a@b.co and Jane.Doe+kw@Mail.Example.COM')).toBe('[email] and [email]');
  });

  it('leaves text without an address alone', () => {
    expect(redactEmails('otp_expired (403)')).toBe('otp_expired (403)');
  });
});

describe('scrubEmails', () => {
  it('walks a Sentry event: exception values, message, breadcrumbs, extra', () => {
    const event = {
      message: `failed for ${FIXTURE_EMAIL}`,
      exception: { values: [{ type: 'AuthApiError', value: `Email address "${FIXTURE_EMAIL}" cannot be used` }] },
      breadcrumbs: [{ category: 'auth', message: `sent code to ${FIXTURE_EMAIL}`, data: { to: FIXTURE_EMAIL } }],
      extra: { context: 'email_otp_send', nested: { deeper: [FIXTURE_EMAIL] } },
      user: { id: 'user-1' },
      level: 'error',
    };
    const scrubbed = scrubEmails(event);
    expect(JSON.stringify(scrubbed)).not.toContain(FIXTURE_EMAIL);
    expect(scrubbed.exception.values[0].value).toBe('Email address "[email]" cannot be used');
    expect(scrubbed.user).toEqual({ id: 'user-1' });
    expect(scrubbed.level).toBe('error');
  });

  it('keeps non-plain objects as they are and stops at a depth limit', () => {
    const err = new Error('x');
    expect(scrubEmails({ err }).err).toBe(err);
    let deep: Record<string, unknown> = { v: FIXTURE_EMAIL };
    for (let i = 0; i < 20; i += 1) deep = { d: deep };
    expect(() => scrubEmails(deep)).not.toThrow();
  });
});

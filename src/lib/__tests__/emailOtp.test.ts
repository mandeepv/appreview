import {
  classifyEmailOtpError,
  emailOtpErrorMessage,
  isPlausibleEmail,
  normalizeEmail,
  sanitizeOtpInput,
} from '../emailOtp';

describe('normalizeEmail', () => {
  it('trims and lowercases — the website matches on the lowercased address', () => {
    expect(normalizeEmail('  Parent@Example.COM ')).toBe('parent@example.com');
  });
});

describe('isPlausibleEmail', () => {
  it.each(['a@b.co', ' Parent@Example.com '])('accepts %p', (s) => {
    expect(isPlausibleEmail(s)).toBe(true);
  });
  it.each(['', 'parent', 'parent@', 'parent@example', 'pa rent@example.com'])('rejects %p', (s) => {
    expect(isPlausibleEmail(s)).toBe(false);
  });
});

describe('sanitizeOtpInput', () => {
  it('keeps digits only, at most six', () => {
    expect(sanitizeOtpInput('12 34-56789')).toBe('123456');
    expect(sanitizeOtpInput('abc')).toBe('');
  });
});

describe('classifyEmailOtpError', () => {
  it('a wrong or expired code', () => {
    expect(classifyEmailOtpError({ code: 'otp_expired', status: 403 })).toBe('invalid_code');
  });

  it('rate limits, by code or by 429', () => {
    expect(classifyEmailOtpError({ code: 'over_email_send_rate_limit' })).toBe('rate_limited');
    expect(classifyEmailOtpError({ code: 'over_request_rate_limit' })).toBe('rate_limited');
    expect(classifyEmailOtpError({ status: 429 })).toBe('rate_limited');
  });

  it('no connection', () => {
    expect(classifyEmailOtpError({ name: 'AuthRetryableFetchError', status: 0 })).toBe('network');
    expect(classifyEmailOtpError(new TypeError('Network request failed'))).toBe('network');
  });

  it('a bad address', () => {
    expect(classifyEmailOtpError({ code: 'email_address_invalid' })).toBe('invalid_email');
  });

  it('the built-in mailer refusing a non-team address is unknown — it means SMTP is not set up', () => {
    expect(classifyEmailOtpError({ code: 'email_address_not_authorized' })).toBe('unknown');
  });

  it('anything else, including null, is unknown', () => {
    expect(classifyEmailOtpError(null)).toBe('unknown');
    expect(classifyEmailOtpError(new Error('boom'))).toBe('unknown');
  });
});

describe('emailOtpErrorMessage', () => {
  it('says something specific and different for send and verify where it matters', () => {
    expect(emailOtpErrorMessage('rate_limited', 'send')).not.toBe(emailOtpErrorMessage('rate_limited', 'verify'));
    expect(emailOtpErrorMessage('invalid_email', 'verify')).toBe(emailOtpErrorMessage('invalid_code', 'verify'));
  });
});

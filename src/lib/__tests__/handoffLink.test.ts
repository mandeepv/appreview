// SPEC-21 — reading a purchase-handoff link. The parser takes untrusted input
// (whatever is on the clipboard, any URL that opens the app) and must hand
// back a key only for the forms we accept: the two universal-link domains the
// website issues, and the custom scheme the simulator flows use. A looser
// match would send other people's links to redeem-handoff; a stricter one
// would turn a buyer's real link into "isn't valid".

import { parseHandoffUrl } from '../handoffLink';
import { FIXTURE_HANDOFF_KEY as KEY, handoffLink } from '../../test/factories';

describe('the forms the app accepts', () => {
  it('the open.kinderwell.app universal link → its key', () => {
    expect(parseHandoffUrl(handoffLink(KEY, 'universal'))).toBe(KEY);
  });

  // The link page lives on open.kinderwell.app, and a universal link tapped on
  // its own domain opens Safari — so its "Open Kinderwell" points here.
  it('the kinderwell.app universal link → its key', () => {
    expect(parseHandoffUrl(handoffLink(KEY, 'main-domain'))).toBe(KEY);
  });

  it('the custom scheme (the simulator flows) → its key', () => {
    expect(parseHandoffUrl(handoffLink(KEY, 'scheme'))).toBe(KEY);
  });

  it.each([
    ['a trailing slash', `https://open.kinderwell.app/k/${KEY}/`],
    ['a query a mail client added', `https://open.kinderwell.app/k/${KEY}?utm_source=mail`],
    ['a fragment', `kinderwell://k/${KEY}#x`],
    ['a pasted newline and spaces', `  https://open.kinderwell.app/k/${KEY}\n`],
    ['an upper-case host', `https://OPEN.Kinderwell.APP/k/${KEY}`],
    ['a trailing slash on the main domain', `https://kinderwell.app/k/${KEY}/`],
  ])('tolerates %s', (_what, url) => {
    expect(parseHandoffUrl(url)).toBe(KEY);
  });

  it('keeps the key exactly as sent — case matters in base64url', () => {
    const mixed = 'aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789-_AbCdE';
    expect(parseHandoffUrl(`kinderwell://k/${mixed}`)).toBe(mixed);
  });
});

describe('anything else is not a handoff link', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['empty', ''],
    ['the bare key, no link around it', KEY],
    ['plain http', `http://open.kinderwell.app/k/${KEY}`],
    ['another host', `https://example.com/k/${KEY}`],
    ['another subdomain', `https://www.kinderwell.app/k/${KEY}`],
    ['a look-alike host', `https://open.kinderwell.app.evil.example/k/${KEY}`],
    ['a look-alike of the main domain', `https://kinderwell.app.evil.example/k/${KEY}`],
    ['a host that only ends the same', `https://xopen.kinderwell.app/k/${KEY}`],
    ['a domain that only ends the same', `https://evilkinderwell.app/k/${KEY}`],
    ['plain http on the main domain', `http://kinderwell.app/k/${KEY}`],
    ['the main domain, another path', `https://kinderwell.app/welcome/${KEY}`],
    ['another path', `https://open.kinderwell.app/x/${KEY}`],
    ['an extra path segment', `https://open.kinderwell.app/k/${KEY}/more`],
    ['a key one character short', `https://open.kinderwell.app/k/${KEY.slice(1)}`],
    ['a key one character long', `https://open.kinderwell.app/k/${KEY}A`],
    ['base64 padding', `https://open.kinderwell.app/k/${KEY.slice(1)}=`],
    ['standard-base64 characters', `kinderwell://k/${KEY.slice(2)}+/`],
    ['the Google sign-in redirect', 'kinderwell://auth/callback?code=abc123'],
    ['the website itself', 'https://kinderwell.app/welcome'],
    ['text with a link inside it', `Open this: https://open.kinderwell.app/k/${KEY}`],
  ])('%s → null', (_what, input) => {
    expect(parseHandoffUrl(input as string | null | undefined)).toBeNull();
  });
});

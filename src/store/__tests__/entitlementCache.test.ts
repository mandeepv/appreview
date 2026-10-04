// SPEC-FIX-08 R3 — regression tests for the user-bound entitlement cache.
//
// These lock in the STRUCTURAL fix for the never-paid-user access class: a
// cached `true` may only be honored for the same user it was written under.
// Each test maps to a verified real-world instance from the spec.

import {
  parseSubRecord,
  resolveCachedEntitlement,
  resolveSuperwallStatus,
} from '../entitlementCache';

const owned = (userId: string, subscribed: boolean) =>
  JSON.stringify({ userId, subscribed });

describe('parseSubRecord', () => {
  // `owned` writes the pre-2026-10 shape, with no `source` — the record every
  // existing install has on disk.
  it('parses a valid owned record; one with no source reads as superwall', () => {
    expect(parseSubRecord(owned('user-A', true))).toEqual({
      userId: 'user-A',
      subscribed: true,
      source: 'superwall',
    });
  });

  it('keeps a web source', () => {
    const raw = JSON.stringify({ userId: 'user-A', subscribed: true, source: 'web' });
    expect(parseSubRecord(raw)?.source).toBe('web');
  });

  it('reads an unrecognised source as superwall (the one Superwall may clear)', () => {
    const raw = JSON.stringify({ userId: 'user-A', subscribed: true, source: 'stripe' });
    expect(parseSubRecord(raw)?.source).toBe('superwall');
  });

  it('returns null for a legacy bare "true" (no owner)', () => {
    expect(parseSubRecord('true')).toBeNull();
  });

  it('returns null for a legacy bare "false"', () => {
    expect(parseSubRecord('false')).toBeNull();
  });

  it('returns null for absent / empty', () => {
    expect(parseSubRecord(null)).toBeNull();
    expect(parseSubRecord(undefined)).toBeNull();
    expect(parseSubRecord('')).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    expect(parseSubRecord('{not json')).toBeNull();
  });

  it('returns null for JSON missing required fields', () => {
    expect(parseSubRecord(JSON.stringify({ userId: 'x' }))).toBeNull();
    expect(parseSubRecord(JSON.stringify({ subscribed: true }))).toBeNull();
    expect(parseSubRecord(JSON.stringify({ userId: 5, subscribed: 'yes' }))).toBeNull();
  });
});

describe('resolveCachedEntitlement — honor only the owning, present user', () => {
  it('honors subscribed=true when the session user owns the record', () => {
    expect(resolveCachedEntitlement(owned('user-A', true), 'user-A')).toEqual({
      honor: true,
      clearStale: false,
    });
  });

  it('does NOT honor when the owning record says subscribed=false', () => {
    expect(resolveCachedEntitlement(owned('user-A', false), 'user-A')).toEqual({
      honor: false,
      clearStale: false,
    });
  });

  // Instance 1 — delete-account: next init has no session at all.
  it('delete-account: no session → not honored, stale cleared', () => {
    const r = resolveCachedEntitlement(owned('user-A', true), undefined);
    expect(r.honor).toBe(false);
    expect(r.clearStale).toBe(true);
  });

  // Instance 2 — session expiry: getSession() → null with a stale owned true.
  it('session expiry: null session with stale owned true → not honored, cleared', () => {
    const r = resolveCachedEntitlement(owned('user-A', true), undefined);
    expect(r.honor).toBe(false);
    expect(r.clearStale).toBe(true);
  });

  // Instance 3 — account switch: cached owner=A, session user=B.
  it('account switch: cached owner A, session user B → not honored for B, cleared', () => {
    const r = resolveCachedEntitlement(owned('user-A', true), 'user-B');
    expect(r.honor).toBe(false);
    expect(r.clearStale).toBe(true);
  });

  // Legacy-format migration: bare 'true' with no owner is NOT a terminal grant.
  it('legacy bare "true" (no userId) → not honored even with a session', () => {
    const r = resolveCachedEntitlement('true', 'user-A');
    expect(r.honor).toBe(false);
    // There is something on disk → clear it so the next launch is clean.
    expect(r.clearStale).toBe(true);
  });

  it('legacy bare "true" with no session → not honored, cleared', () => {
    const r = resolveCachedEntitlement('true', undefined);
    expect(r.honor).toBe(false);
    expect(r.clearStale).toBe(true);
  });

  it('nothing on disk + no session → not honored, nothing to clear', () => {
    expect(resolveCachedEntitlement(null, undefined)).toEqual({
      honor: false,
      clearStale: false,
    });
  });

  it('nothing on disk + a session → not honored, nothing to clear', () => {
    expect(resolveCachedEntitlement(null, 'user-A')).toEqual({
      honor: false,
      clearStale: false,
    });
  });

  it('malformed value with a session → not honored, cleared', () => {
    const r = resolveCachedEntitlement('{garbage', 'user-A');
    expect(r.honor).toBe(false);
    expect(r.clearStale).toBe(true);
  });
});

describe('resolveCachedEntitlement — a web record binds exactly like an Apple one', () => {
  const web = (userId: string) => JSON.stringify({ userId, subscribed: true, source: 'web' });

  it('honors a web record for its owner', () => {
    expect(resolveCachedEntitlement(web('user-A'), 'user-A')).toEqual({ honor: true, clearStale: false });
  });

  it('does not honor a web record for another user, and clears it', () => {
    expect(resolveCachedEntitlement(web('user-A'), 'user-B')).toEqual({ honor: false, clearStale: true });
  });
});

// Web purchases (2026-10): every web buyer is INACTIVE to Superwall, so the
// listener must not treat INACTIVE as "clear" for a web-vouched flag.
describe('resolveSuperwallStatus — who may clear the flag', () => {
  it('INACTIVE keeps a web flag', () => {
    expect(resolveSuperwallStatus('INACTIVE', 'web')).toBe('keep');
  });

  it('INACTIVE clears a superwall flag', () => {
    expect(resolveSuperwallStatus('INACTIVE', 'superwall')).toBe('clear');
  });

  it('INACTIVE with no flag clears (a harmless no-op)', () => {
    expect(resolveSuperwallStatus('INACTIVE', null)).toBe('clear');
  });

  it('ACTIVE subscribes as superwall, whatever was there — Apple wins', () => {
    expect(resolveSuperwallStatus('ACTIVE', null)).toBe('subscribe');
    expect(resolveSuperwallStatus('ACTIVE', 'web')).toBe('subscribe');
    expect(resolveSuperwallStatus('ACTIVE', 'superwall')).toBe('subscribe');
  });

  it('UNKNOWN keeps either flag', () => {
    expect(resolveSuperwallStatus('UNKNOWN', 'web')).toBe('keep');
    expect(resolveSuperwallStatus('UNKNOWN', 'superwall')).toBe('keep');
  });
});

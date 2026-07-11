// SPEC-FIX-08 R3 — regression tests for the user-bound entitlement cache.
//
// These lock in the STRUCTURAL fix for the never-paid-user access class: a
// cached `true` may only be honored for the same user it was written under.
// Each test maps to a verified real-world instance from the spec.

import {
  parseSubRecord,
  resolveCachedEntitlement,
} from '../entitlementCache';

const owned = (userId: string, subscribed: boolean) =>
  JSON.stringify({ userId, subscribed });

describe('parseSubRecord', () => {
  it('parses a valid owned record', () => {
    expect(parseSubRecord(owned('user-A', true))).toEqual({ userId: 'user-A', subscribed: true });
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

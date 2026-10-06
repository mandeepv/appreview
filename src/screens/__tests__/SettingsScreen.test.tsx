// SPEC-20 R7 — the Profile tab: managing, restoring and deleting a
// subscription and an account. What matters:
//
//  - The kinderwell.app/manage link is for web subscribers only; everyone
//    else manages through the App Store (INVARIANTS #26, App Store 3.1.3).
//  - Each restore outcome tells the parent the truth — never "No Purchases
//    Found" while the App Store is still resolving.
//  - The delete warning matches who bills them: a web subscription is
//    cancelled with the account; an Apple one keeps billing until cancelled
//    in iOS Settings. If the web cancel fails, nothing was deleted and the
//    message says so.
//  - Log out closes the analytics identity BEFORE the session ends.
//
// deleteAccount itself is tested in deleteAccount.test; here it is stubbed so
// the screen's handling of each result can be driven directly.

import { Alert, Linking } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';
import { deleteAccount, SubscriptionCancelError } from '../../services/authService';
import { renderScreen } from '../../test/render';
import { resetSupabaseFake, supabase } from '../../test/supabase';
import { SuperwallExpoModule, resetSuperwallFake } from '../../test/superwall';
import { lastCapture, posthogModule, resetAnalyticsFakes } from '../../test/analytics';
import { makeUser } from '../../test/factories';
import { seedAuthStore } from '../../test/stores';

jest.mock('../../services/authService', () => ({
  ...jest.requireActual('../../services/authService'),
  deleteAccount: jest.fn(),
}));

type Button = { text: string; onPress?: () => unknown };

const userA = makeUser('user-a');
const deleteAccountMock = deleteAccount as jest.Mock;
let alertSpy: jest.SpyInstance;
let openURL: jest.SpyInstance;

const renderSettings = () => renderScreen(SettingsScreen, { name: 'Settings' });

/** Press a button in the most recent Alert. */
async function pressAlertButton(text: string) {
  const buttons = alertSpy.mock.calls[alertSpy.mock.calls.length - 1][2] as Button[];
  const button = buttons.find((b) => b.text === text);
  expect(button).toBeDefined();
  await act(async () => {
    await button!.onPress?.();
  });
}

const alertTitles = () => alertSpy.mock.calls.map((call) => call[0]);

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  // React Native's Jest setup already makes these mocks, so spyOn returns the
  // same function each time — clear its calls, or they carry across tests.
  openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  openURL.mockClear();
  jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
  resetSupabaseFake();
  resetSuperwallFake();
  resetAnalyticsFakes();
  deleteAccountMock.mockReset();
  seedAuthStore({ user: userA });
});

afterEach(() => jest.restoreAllMocks());

describe('managing a subscription (INVARIANTS #26)', () => {
  it('web subscriber → told where, and sent to kinderwell.app/manage', async () => {
    seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'web' });
    await renderSettings();
    expect(screen.getByText('Your subscription is managed at kinderwell.app/manage')).toBeTruthy();
    await fireEvent.press(screen.getByText('Manage subscription'));
    expect(openURL).toHaveBeenCalledWith('https://kinderwell.app/manage');
    expect(lastCapture('subscription_managed')).toEqual({ source: 'web' });
  });

  it.each([
    ['an Apple subscriber', { isSubscribed: true, subscriptionSource: 'superwall' as const }],
    ['not subscribed', { isSubscribed: false, subscriptionSource: null }],
  ])('%s → no website mention, sent to App Store subscriptions', async (_label, state) => {
    seedAuthStore({ user: userA, ...state });
    await renderSettings();
    expect(screen.queryByText(/kinderwell\.app/)).toBeNull();
    await fireEvent.press(screen.getByText('Manage subscription'));
    expect(openURL).toHaveBeenCalledWith('https://apps.apple.com/account/subscriptions');
    expect(openURL).not.toHaveBeenCalledWith(expect.stringContaining('kinderwell.app'));
  });
});

describe('restore purchases', () => {
  it.each([
    { label: 'restored', restore: { result: 'restored' }, status: 'ACTIVE', title: 'Restored' },
    { label: 'still resolving', restore: { result: 'restored' }, status: 'UNKNOWN', title: 'Still Syncing' },
    { label: 'nothing to restore', restore: { result: 'restored' }, status: 'INACTIVE', title: 'No Purchases Found' },
    { label: 'restore failed', restore: { result: 'failed', errorMessage: 'Cannot connect to iTunes Store' }, status: 'INACTIVE', title: 'Restore Failed' },
  ])('$label → the "$title" alert', async ({ restore, status, title }) => {
    SuperwallExpoModule.restorePurchases.mockResolvedValue({ errorMessage: null, ...restore });
    SuperwallExpoModule.getSubscriptionStatus.mockResolvedValue({ status });
    await renderSettings();
    await fireEvent.press(screen.getByText('Restore purchases'));
    expect(alertTitles()).toEqual([title]);
  });
});

describe('delete account', () => {
  async function openDeleteDialog() {
    await renderSettings();
    await fireEvent.press(screen.getByText('Delete account'));
    expect(alertSpy.mock.calls[0][0]).toBe('Delete your account?');
    return alertSpy.mock.calls[0][1] as string;
  }

  it('web subscriber → warned it cancels the web subscription', async () => {
    seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'web' });
    const message = await openDeleteDialog();
    expect(message).toMatch(/also cancels your Kinderwell subscription/);
    expect(message).not.toMatch(/billed by Apple/);
  });

  it('Apple subscriber → warned Apple keeps billing until cancelled in iOS Settings', async () => {
    seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'superwall' });
    const message = await openDeleteDialog();
    expect(message).toMatch(/billed by Apple and will continue after account deletion/);
  });

  it('success → deleted, analytics identity reset, confirmed', async () => {
    deleteAccountMock.mockResolvedValue(undefined);
    await openDeleteDialog();
    await pressAlertButton('Delete Account');
    expect(deleteAccountMock).toHaveBeenCalledTimes(1);
    expect(posthogModule.resetPostHog).toHaveBeenCalled();
    expect(alertTitles()).toContain('Account deleted');
  });

  it('the web subscription could not be cancelled → "nothing was deleted", identity kept', async () => {
    deleteAccountMock.mockRejectedValue(new SubscriptionCancelError());
    await openDeleteDialog();
    await pressAlertButton('Delete Account');
    const failure = alertSpy.mock.calls.find((call) => call[0] === 'Delete Failed');
    expect(failure?.[1]).toMatch(/couldn't cancel your subscription, so nothing was deleted/);
    expect(posthogModule.resetPostHog).not.toHaveBeenCalled();
  });

  it('any other failure → the generic message', async () => {
    deleteAccountMock.mockRejectedValue(new Error('Edge Function returned 400'));
    await openDeleteDialog();
    await pressAlertButton('Delete Account');
    const failure = alertSpy.mock.calls.find((call) => call[0] === 'Delete Failed');
    expect(failure?.[1]).toBe('Could not delete account. Please try again or contact support.');
  });

  it('demo user → signed out locally; the delete function is never called', async () => {
    seedAuthStore({ user: userA, isDemoUser: true, isSubscribed: true });
    await openDeleteDialog();
    await pressAlertButton('Delete Account');
    expect(deleteAccountMock).not.toHaveBeenCalled();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});

it('log out → analytics identity reset BEFORE the session ends', async () => {
  const order: string[] = [];
  posthogModule.resetPostHog.mockImplementation(() => order.push('resetPostHog'));
  supabase.auth.signOut.mockImplementation(async () => {
    order.push('signOut');
    return { error: null };
  });
  await renderSettings();
  await fireEvent.press(screen.getByText('Log out'));
  await pressAlertButton('Log Out');
  expect(order).toEqual(['resetPostHog', 'signOut']);
});

// SPEC-21 — the purchase handoff screen. What it must get right:
//
//  - The way in is the gate: a redeemed key ends at Loading, never Root
//    (INVARIANTS #1). Loading then finds the web purchase — or, for a buyer
//    refunded since, shows the paywall.
//  - Accounts: someone else signed in is signed out BEFORE the buyer is
//    signed in, which clears their cached unlock (INVARIANTS #3) — but only
//    once the link has proved good. A dead link signs nobody out.
//  - Every failure ends at email sign-in, worded for that failure; nothing
//    mentions buying on the web (INVARIANTS #26).
//  - The key is a login credential (INVARIANTS #29): the global PII guard
//    fails any test here in which it reaches PostHog or Sentry.
//
// redeem-handoff (functions.invoke) and verifyOtp are the global Supabase
// fake; the clipboard is the global expo-clipboard fake.

import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HandoffScreen } from '../HandoffScreen';
import { useAuthStore } from '../../../store/authStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useHandoffStore } from '../../../store/handoffStore';
import { STORAGE_KEYS } from '../../../constants/storageKeys';
import { renderScreen } from '../../../test/render';
import type { FakeNavigation } from '../../../test/navigation';
import { resetSupabaseFake, supabase } from '../../../test/supabase';
import {
  capturedEvents,
  lastCapture,
  posthog,
  posthogModule,
  resetAnalyticsFakes,
  sentryModule,
} from '../../../test/analytics';
import { clipboard, clipboardModule, copyToClipboard, resetClipboardFake } from '../../../test/clipboard';
import {
  FIXTURE_HANDOFF_KEY as KEY,
  handoffLink,
  makeSession,
  makeUser,
  onboardingAnswers,
} from '../../../test/factories';
import { seedAuthStore, seedOnboardingStore } from '../../../test/stores';

const buyer = makeUser('buyer-1');
// The account a buyer gets by signing in with Apple's Hide My Email.
const relayAccount = makeUser('apple-relay');

const REDEEMED = { data: { result: 'ok', token_hash: 'th_buyer', user_id: 'buyer-1' }, error: null };

/** functions.invoke's answer for a non-2xx: the body sits behind error.context. */
function refused(result: string, status = 410) {
  return {
    data: null,
    error: Object.assign(new Error('Edge Function returned a non-2xx status code'), {
      context: new Response(JSON.stringify({ result }), { status }),
    }),
  };
}

const openOffer = () => renderScreen(HandoffScreen, { name: 'Handoff' });

/** A link opened the app: the key is waiting in the store when the screen mounts. */
const openWithLink = () => {
  useHandoffStore.getState().receive(KEY, 'link');
  return renderScreen(HandoffScreen, { name: 'Handoff' });
};

const signedInAs = (user: ReturnType<typeof makeUser>, overrides = {}) =>
  seedAuthStore({ user, session: makeSession(user), ...overrides });

async function reachedGate(navigation: FakeNavigation) {
  await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('Loading'));
  neverRoot(navigation);
}

function neverRoot(navigation: FakeNavigation) {
  expect(navigation.replace).not.toHaveBeenCalledWith('Root');
  expect(navigation.navigate).not.toHaveBeenCalledWith('Root');
  for (const [state] of navigation.reset.mock.calls) {
    expect(JSON.stringify(state)).not.toContain('"Root"');
  }
}

const promptDone = async () => (await AsyncStorage.getItem(STORAGE_KEYS.HANDOFF_PROMPT_DONE)) === 'true';

beforeEach(async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  await AsyncStorage.clear();
  resetSupabaseFake();
  resetAnalyticsFakes();
  resetClipboardFake();
  seedAuthStore();
  seedOnboardingStore();
  useHandoffStore.setState({ pendingKey: null, pendingSource: null, greetingPending: false });
  supabase.functions.invoke.mockResolvedValue(REDEEMED);
  supabase.auth.verifyOtp.mockResolvedValue({ data: { session: makeSession(buyer) }, error: null });
});

afterEach(() => jest.restoreAllMocks());

describe('the offer — a fresh install with a link on the clipboard', () => {
  it("shows the spec's words and Apple's Paste button, and counts the offer once", async () => {
    await openOffer();
    expect(screen.getByText('Welcome to Kinderwell.')).toBeTruthy();
    expect(screen.getByText('Tap Paste to finish setting up.')).toBeTruthy();
    expect(screen.getByTestId('handoff-paste')).toBeTruthy();
    expect(screen.getByText('Not now')).toBeTruthy();
    expect(capturedEvents().filter((e) => e === 'handoff_paste_offered')).toHaveLength(1);
    // Paste is the parent's tap; nothing reads the clipboard before it.
    expect(clipboardModule.getStringAsync).not.toHaveBeenCalled();
  });

  it('Paste our link → redeemed, the buyer signed in, then the gate — never Root', async () => {
    copyToClipboard(handoffLink());
    const navigation = await openOffer();
    await fireEvent.press(screen.getByTestId('handoff-paste'));
    await reachedGate(navigation);

    expect(supabase.functions.invoke).toHaveBeenCalledWith('redeem-handoff', { body: { key: KEY } });
    expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'th_buyer', type: 'magiclink' });
    expect(useAuthStore.getState().user?.id).toBe('buyer-1');
    // Identified by id only — no $set from an empty store.
    expect(posthog.identify).toHaveBeenCalledWith('buyer-1', expect.not.objectContaining({ $set: expect.anything() }));
    expect(lastCapture('handoff_paste_result')).toEqual({ matched: true });
    expect(lastCapture('handoff_redeemed')).toEqual({ result: 'ok', source: 'clipboard' });
    expect(useHandoffStore.getState().greetingPending).toBe(true);
    expect(await promptDone()).toBe(true);
  });

  it('the redeemed link is taken off the clipboard', async () => {
    copyToClipboard(handoffLink());
    const navigation = await openOffer();
    await fireEvent.press(screen.getByTestId('handoff-paste'));
    await reachedGate(navigation);
    expect(clipboard.text).toBe('');
  });

  it("Paste someone else's link → Welcome; it is sent nowhere", async () => {
    copyToClipboard('https://example.com/a-recipe');
    const navigation = await openOffer();
    await fireEvent.press(screen.getByTestId('handoff-paste'));
    expect(navigation.replace).toHaveBeenCalledWith('Welcome');
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
    expect(lastCapture('handoff_paste_result')).toEqual({ matched: false });
    expect(await promptDone()).toBe(true);
  });

  it('Not now → Welcome, and the offer is never made again', async () => {
    const navigation = await openOffer();
    await fireEvent.press(screen.getByText('Not now'));
    expect(navigation.replace).toHaveBeenCalledWith('Welcome');
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
    await waitFor(async () => expect(await promptDone()).toBe(true));
  });

  it("iOS 15 (no Apple Paste button) → a plain Paste button reads the clipboard from the tap", async () => {
    clipboard.pasteButtonAvailable = false;
    copyToClipboard(handoffLink());
    const navigation = await openOffer();
    expect(screen.queryByTestId('handoff-paste')).toBeNull();
    await fireEvent.press(screen.getByText('Paste'));
    await reachedGate(navigation);
    expect(clipboardModule.getStringAsync).toHaveBeenCalledTimes(1);
  });
});

describe('a link opened the app', () => {
  it('redeems straight away: no offer, source "link", the clipboard untouched', async () => {
    const navigation = await openWithLink();
    await reachedGate(navigation);
    expect(capturedEvents()).not.toContain('handoff_paste_offered');
    expect(lastCapture('handoff_redeemed')).toEqual({ result: 'ok', source: 'link' });
    expect(clipboardModule.setStringAsync).not.toHaveBeenCalled();
    expect(useHandoffStore.getState().pendingKey).toBeNull();
  });

  it('a link tapped while the offer is up is redeemed', async () => {
    const navigation = await openOffer();
    await act(async () => useHandoffStore.getState().receive(KEY, 'link'));
    await reachedGate(navigation);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('redeem-handoff', { body: { key: KEY } });
  });

  // BACKLOG #27: answers half-given on this device would resume the questions
  // on the next launch and end at a second sign-in.
  it('half-finished answers on the device are cleared — no questions next launch', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_LAST_SCREEN, 'NameAge');
    seedOnboardingStore(onboardingAnswers() as never);
    const navigation = await openWithLink();
    await reachedGate(navigation);
    expect(useOnboardingStore.getState().userType).toBeNull();
    expect(await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_LAST_SCREEN)).toBeNull();
  });
});

describe('whoever is signed in already', () => {
  it("someone else → signed out first, clearing their unlock (INVARIANTS #3), then the buyer", async () => {
    signedInAs(relayAccount, { isSubscribed: true, subscriptionSource: 'superwall' });
    await AsyncStorage.setItem(
      STORAGE_KEYS.IS_SUBSCRIBED,
      JSON.stringify({ userId: 'apple-relay', subscribed: true, source: 'superwall' }),
    );
    const navigation = await openWithLink();
    await reachedGate(navigation);

    expect(posthogModule.resetPostHog).toHaveBeenCalled();
    const signedOutAt = supabase.auth.signOut.mock.invocationCallOrder[0];
    expect(signedOutAt).toBeLessThan(supabase.auth.verifyOtp.mock.invocationCallOrder[0]);
    expect(useAuthStore.getState().user?.id).toBe('buyer-1');
    // The gate must not read the previous account's unlock as the buyer's.
    expect(useAuthStore.getState().isSubscribed).toBe(false);
    expect(await AsyncStorage.getItem(STORAGE_KEYS.IS_SUBSCRIBED)).toBeNull();
  });

  it('the demo user → switched out, demo flags gone', async () => {
    useAuthStore.getState().setDemoUser();
    const navigation = await openWithLink();
    await reachedGate(navigation);
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({ isDemoUser: false, isSubscribed: false });
    expect(useAuthStore.getState().user?.id).toBe('buyer-1');
  });

  it('the buyer themselves → straight to the gate, no second session, no sign-out', async () => {
    signedInAs(buyer);
    const navigation = await openWithLink();
    await reachedGate(navigation);
    expect(supabase.auth.verifyOtp).not.toHaveBeenCalled();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
    expect(useHandoffStore.getState().greetingPending).toBe(false);
  });

  it('a dead link → whoever is signed in STAYS signed in; Not now returns them to their gate', async () => {
    signedInAs(relayAccount);
    supabase.functions.invoke.mockResolvedValue(refused('expired'));
    const navigation = await openWithLink();
    expect(await screen.findByText('This link has expired.')).toBeTruthy();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user?.id).toBe('apple-relay');

    await fireEvent.press(screen.getByText('Not now'));
    expect(navigation.replace).toHaveBeenCalledWith('Loading');
  });
});

describe('a link that fails — the email fallback, worded for the failure', () => {
  it.each([
    ['expired', 410, 'This link has expired.', 'Sign in with the email you used.'],
    ['used', 410, 'This link has already been used.', 'Sign in with the email you used.'],
    ['unknown', 404, "This link isn't valid.", 'Sign in with the email you used.'],
    ['not_entitled', 403, "We couldn't sign you in.", 'Sign in with the email you used.'],
    ['rate_limited', 429, 'Too many tries.', 'Wait a few minutes, or sign in with the email you used.'],
    ['error', 500, "We couldn't sign you in.", 'Check your connection and try again, or sign in with the email you used.'],
  ])('%s (HTTP %d) → its own headline, then email sign-in', async (result, status, headline, body) => {
    supabase.functions.invoke.mockResolvedValue(refused(result, status));
    const navigation = await openWithLink();
    expect(await screen.findByText(headline)).toBeTruthy();
    expect(screen.getByText(body)).toBeTruthy();
    expect(screen.getByText('Continue with Email')).toBeTruthy();
    expect(lastCapture('handoff_redeemed')).toEqual({ result, source: 'link' });
    expect(navigation.replace).not.toHaveBeenCalledWith('Loading');
    expect(supabase.auth.verifyOtp).not.toHaveBeenCalled();
    // No web-purchase wording anywhere on it (INVARIANTS #26).
    expect(screen.queryByText(/buy|bought|purchase|website|kinderwell\.app|price/i)).toBeNull();
  });

  it('Continue with Email → the sign-in screen, opened at the email field', async () => {
    supabase.functions.invoke.mockResolvedValue(refused('expired'));
    const navigation = await openWithLink();
    await fireEvent.press(await screen.findByText('Continue with Email'));
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 1,
      routes: [{ name: 'Welcome' }, { name: 'Auth', params: { mode: 'signin', startWith: 'email' } }],
    });
    neverRoot(navigation);
  });

  it('Continue with Email while someone else is signed in → they are signed out first', async () => {
    signedInAs(relayAccount);
    supabase.functions.invoke.mockResolvedValue(refused('used'));
    const navigation = await openWithLink();
    await fireEvent.press(await screen.findByText('Continue with Email'));
    await waitFor(() => expect(navigation.reset).toHaveBeenCalled());
    expect(supabase.auth.signOut.mock.invocationCallOrder[0]).toBeLessThan(
      navigation.reset.mock.invocationCallOrder[0],
    );
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('a sign-out that fails → stays put, reported, no half-switched account', async () => {
    signedInAs(relayAccount);
    supabase.functions.invoke.mockResolvedValue(refused('used'));
    supabase.auth.signOut.mockResolvedValue({ error: new Error('offline') });
    const navigation = await openWithLink();
    await fireEvent.press(await screen.findByText('Continue with Email'));
    await waitFor(() =>
      expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), {
        context: 'handoff_fallback_sign_out',
      }),
    );
    expect(navigation.reset).not.toHaveBeenCalled();
  });

  it('Not now, signed out → Welcome', async () => {
    supabase.functions.invoke.mockResolvedValue(refused('unknown', 404));
    const navigation = await openWithLink();
    await fireEvent.press(await screen.findByText('Not now'));
    expect(navigation.replace).toHaveBeenCalledWith('Welcome');
  });

  it('a server error offers Try again, which works once the blip has passed', async () => {
    supabase.functions.invoke.mockResolvedValueOnce(refused('error', 500)).mockResolvedValueOnce(REDEEMED);
    const navigation = await openWithLink();
    await fireEvent.press(await screen.findByText('Try again'));
    await reachedGate(navigation);
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
    expect(supabase.functions.invoke).toHaveBeenLastCalledWith('redeem-handoff', { body: { key: KEY } });
  });

  it('a second link tapped while the first is still redeeming is tried when the first fails', async () => {
    let answerFirst: (value: unknown) => void = () => {};
    supabase.functions.invoke
      .mockImplementationOnce(() => new Promise((resolve) => (answerFirst = resolve)))
      .mockResolvedValueOnce(REDEEMED);
    const navigation = await openWithLink();
    await act(async () => useHandoffStore.getState().receive(`${KEY.slice(0, -1)}2`, 'link'));
    await act(async () => answerFirst(refused('expired')));
    await reachedGate(navigation);
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
  });

  it('a spent or dead link offers no Try again', async () => {
    supabase.functions.invoke.mockResolvedValue(refused('expired'));
    await openWithLink();
    await screen.findByText('This link has expired.');
    expect(screen.queryByText('Try again')).toBeNull();
  });

  it('the token fails to verify → the email fallback, and no retry (the key is spent)', async () => {
    supabase.auth.verifyOtp.mockResolvedValue({ data: { session: null }, error: new Error('Email link is invalid') });
    const navigation = await openWithLink();
    expect(await screen.findByText("We couldn't sign you in.")).toBeTruthy();
    expect(screen.queryByText('Try again')).toBeNull();
    expect(lastCapture('handoff_redeemed')).toEqual({ result: 'error', source: 'link' });
    expect(navigation.replace).not.toHaveBeenCalledWith('Loading');
    expect(useAuthStore.getState().user).toBeNull();
  });
});

it('while redeeming, it says so', async () => {
  supabase.functions.invoke.mockReturnValue(new Promise(() => {}));
  await openWithLink();
  expect(screen.getByText('Signing you in…')).toBeTruthy();
});

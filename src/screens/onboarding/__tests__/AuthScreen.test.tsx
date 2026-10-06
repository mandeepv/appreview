// SPEC-20 R5 — sign-in routing and the sign-in screen's contracts.
//
//  - After any sign-in, the user goes to Loading (the gate) or back into the
//    questionnaire — never Root (INVARIANTS #1; the v1.1.0 sign-in bypass sent
//    returning users straight to Root).
//  - An error from the onboarding check is never read as "no onboarding"
//    (INVARIANTS #6): that would re-onboard a real user and overwrite their
//    profile. They are signed out to retry instead.
//  - Analytics identity is the user id only; signup attaches answers as $set
//    (never email or name), sign-in attaches none (INVARIANTS #8).
//  - The labels the website quotes, and Sign in with Apple wherever Google
//    or email is offered (INVARIANTS #26, #27).
//
// Supabase (onboarding check, email OTP), PostHog and Sentry are the global
// fakes. Google and Apple sign-in open native sheets, so those two service
// functions — and Apple's native button — are stubbed here.

import { Alert } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthScreen } from '../AuthScreen';
import { signInWithApple, signInWithGoogle } from '../../../services/authService';
import { useAuthStore } from '../../../store/authStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { makeNavigation } from '../../../test/navigation';
import { renderScreen } from '../../../test/render';
import { resetSupabaseFake, setTableResult, supabase } from '../../../test/supabase';
import {
  capturedEvents,
  lastCapture,
  posthog,
  resetAnalyticsFakes,
  sentryModule,
} from '../../../test/analytics';
import { FIXTURE_EMAIL, makeSession, makeUser, onboardingAnswers } from '../../../test/factories';
import { seedAuthStore, seedOnboardingStore } from '../../../test/stores';

jest.mock('../../../services/authService', () => ({
  ...jest.requireActual('../../../services/authService'),
  signInWithGoogle: jest.fn(),
  signInWithApple: jest.fn(),
}));

// The real button is a native view; this stand-in renders and presses like one.
jest.mock('expo-apple-authentication', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react');
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    AppleAuthenticationButton: ({ onPress }: { onPress: () => void }) =>
      ReactActual.createElement(
        RN.Pressable,
        { onPress, accessibilityRole: 'button' },
        ReactActual.createElement(RN.Text, null, 'Continue with Apple'),
      ),
    AppleAuthenticationButtonType: { CONTINUE: 1 },
    AppleAuthenticationButtonStyle: { BLACK: 2 },
    AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    signInAsync: jest.fn(),
  };
});

type Mode = 'signin' | 'signup';

const userA = makeUser('user-a');
const googleSignIn = signInWithGoogle as jest.Mock;
const appleSignIn = signInWithApple as jest.Mock;

const PROFILE = {
  has_onboarding: { data: { id: 'user-a', user_type: 'parent' }, error: null },
  no_onboarding: { data: null, error: { code: 'PGRST116', message: 'no rows' } },
  error: { data: null, error: { code: '500', message: 'network down' } },
};

const renderAuth = (mode: Mode) => renderScreen(AuthScreen, { name: 'Auth', params: { mode } });

/** Sign in with Google (stubbed) and let the post-sign-in routing run. */
async function signInWithGoogleAs(mode: Mode, profile: keyof typeof PROFILE) {
  setTableResult('user_profiles', PROFILE[profile]);
  googleSignIn.mockResolvedValue(makeSession(userA));
  const navigation = await renderAuth(mode);
  await fireEvent.press(screen.getByText('Continue with Google'));
  return navigation;
}

const neverRoot = (navigation: ReturnType<typeof makeNavigation>) => {
  expect(navigation.replace).not.toHaveBeenCalledWith('Root');
  expect(navigation.navigate).not.toHaveBeenCalledWith('Root');
};

let alertSpy: jest.SpyInstance;

beforeEach(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await AsyncStorage.clear();
  resetSupabaseFake();
  resetAnalyticsFakes();
  googleSignIn.mockReset();
  appleSignIn.mockReset();
  seedAuthStore();
  seedOnboardingStore();
});

afterEach(() => jest.restoreAllMocks());

describe('the labels the website quotes, and Apple wherever Google or email is (INVARIANTS #26, #27)', () => {
  it.each<Mode>(['signup', 'signin'])('%s: Google, Apple and "Continue with Email" are all offered', async (mode) => {
    await renderAuth(mode);
    expect(screen.getByText('Continue with Google')).toBeTruthy();
    expect(screen.getByText('Continue with Apple')).toBeTruthy();
    // kinderwell.app's /welcome page and emails quote this label word for word.
    expect(screen.getByText('Continue with Email')).toBeTruthy();
  });
});

describe('after sign-in — the gate or the questionnaire, never Root', () => {
  it.each<Mode>(['signin', 'signup'])(
    '%s, profile exists → the gate, local questionnaire cleared (v1.1.0 bypass)',
    async (mode) => {
      seedOnboardingStore(onboardingAnswers() as never);
      const navigation = await signInWithGoogleAs(mode, 'has_onboarding');
      expect(navigation.replace).toHaveBeenCalledWith('Loading');
      expect(useOnboardingStore.getState().userType).toBeNull();
      neverRoot(navigation);
    },
  );

  it('signin, no profile → the questionnaire', async () => {
    const navigation = await signInWithGoogleAs('signin', 'no_onboarding');
    expect(navigation.replace).toHaveBeenCalledWith('UserType');
    neverRoot(navigation);
  });

  it('signup, no profile → the gate, which saves the fresh answers', async () => {
    seedOnboardingStore(onboardingAnswers() as never);
    const navigation = await signInWithGoogleAs('signup', 'no_onboarding');
    expect(navigation.replace).toHaveBeenCalledWith('Loading');
    expect(capturedEvents()).toContain('onboarding_completed');
    // The answers stay in the store for Loading to save.
    expect(useOnboardingStore.getState().userType).toBe('parent');
    neverRoot(navigation);
  });

  // INVARIANTS #6: an error is not "no profile". Re-onboarding here would
  // overwrite a real user's answers.
  it.each<Mode>(['signin', 'signup'])(
    '%s, the onboarding check fails → signed out to retry, never the questionnaire',
    async (mode) => {
      const navigation = await signInWithGoogleAs(mode, 'error');
      expect(navigation.replace).not.toHaveBeenCalled();
      expect(navigation.navigate).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith("Couldn't verify your account", expect.any(String), expect.any(Array));
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), {
        context: 'post_signin_onboarding_check',
        user_id: 'user-a',
      });
    },
  );

  it('the native sheet is cancelled (no session) → stays here, nothing routed', async () => {
    googleSignIn.mockResolvedValue(null);
    const navigation = await renderAuth('signup');
    await fireEvent.press(screen.getByText('Continue with Google'));
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('provider sign-in (Phase 6 gap-fill)', () => {
  it('Apple → signs in and routes through the same gate as Google', async () => {
    setTableResult('user_profiles', PROFILE.has_onboarding);
    appleSignIn.mockResolvedValue(makeSession(userA));
    const navigation = await renderAuth('signin');
    await fireEvent.press(screen.getByText('Continue with Apple'));
    expect(appleSignIn).toHaveBeenCalledTimes(1);
    expect(navigation.replace).toHaveBeenCalledWith('Loading');
    neverRoot(navigation);
  });

  it('a provider failure → "Sign In Failed", reported with the provider, nothing routed', async () => {
    const failure = new Error('network down');
    googleSignIn.mockRejectedValue(failure);
    const navigation = await renderAuth('signup');
    await fireEvent.press(screen.getByText('Continue with Google'));
    expect(alertSpy).toHaveBeenCalledWith('Sign In Failed', 'network down', expect.any(Array));
    expect(sentryModule.reportError).toHaveBeenCalledWith(failure, { auth_method: 'google', screen: 'AuthScreen' });
    expect(lastCapture('auth_abandoned')).toEqual({ auth_method: 'google', context: 'new_user', reason: 'error' });
    expect(navigation.replace).not.toHaveBeenCalled();
  });
});

describe('analytics identity (INVARIANTS #8)', () => {
  // The global PII guard also fails these if the fixture email or name
  // reaches PostHog in any call.
  it('signup → identified by user id, answers as $set, no email or name', async () => {
    seedOnboardingStore(onboardingAnswers() as never);
    await signInWithGoogleAs('signup', 'no_onboarding');
    const [id, props] = posthog.identify.mock.calls[0];
    expect(id).toBe('user-a');
    expect(props.$set.user_type).toBe('parent');
    expect('email' in props.$set).toBe(false);
    expect('name' in props.$set).toBe(false);
  });

  it('signin → identified by user id with no $set (no overwrite with an empty store)', async () => {
    await signInWithGoogleAs('signin', 'has_onboarding');
    const [id, props] = posthog.identify.mock.calls[0];
    expect(id).toBe('user-a');
    expect(props.$set).toBeUndefined();
  });
});

describe('email sign-in', () => {
  async function requestCode(mode: Mode, typedEmail = 'Parent.Fixture@Example.com') {
    const navigation = await renderAuth(mode);
    await fireEvent.press(screen.getByText('Continue with Email'));
    await fireEvent.changeText(screen.getByLabelText('Your email'), typedEmail);
    await fireEvent.press(screen.getByText('Send code'));
    return navigation;
  }

  beforeEach(() => {
    supabase.auth.signInWithOtp.mockResolvedValue({ data: {}, error: null });
    supabase.auth.verifyOtp.mockResolvedValue({ data: { session: makeSession(userA) }, error: null });
  });

  it('send → verify → the gate; the address is normalised before it is sent', async () => {
    setTableResult('user_profiles', PROFILE.has_onboarding);
    const navigation = await requestCode('signin');

    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({ email: FIXTURE_EMAIL });
    expect(screen.getByText(/We sent a 6-digit code to/)).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('6-digit code'), '123456');
    await fireEvent.press(screen.getByText('Verify'));

    expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({ email: FIXTURE_EMAIL, token: '123456', type: 'email' });
    expect(navigation.replace).toHaveBeenCalledWith('Loading');
    neverRoot(navigation);
  });

  it('"Use a different email" → back to the address step; backing out → the providers, logged as abandoned', async () => {
    await requestCode('signin');
    await fireEvent.press(screen.getByText('Use a different email'));
    expect(screen.getByLabelText('Your email')).toBeTruthy();

    await fireEvent.press(screen.getByText('Use another way to sign in'));
    expect(screen.getByText('Continue with Google')).toBeTruthy();
    expect(lastCapture('auth_abandoned')).toEqual({ auth_method: 'email', context: 'returning_user', reason: 'backed_out' });
  });

  it('a wrong or expired code → an inline message, not signed in, not reported', async () => {
    supabase.auth.verifyOtp.mockResolvedValue({
      data: { session: null },
      error: Object.assign(new Error('Token has expired or is invalid'), { code: 'otp_expired', status: 403 }),
    });
    const navigation = await requestCode('signin');
    await fireEvent.changeText(screen.getByLabelText('6-digit code'), '000000');
    await fireEvent.press(screen.getByText('Verify'));

    expect(screen.getByText('That code is wrong or has expired. Check it, or send a new one.')).toBeTruthy();
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(sentryModule.reportError).not.toHaveBeenCalled();
  });

  // Supabase's built-in mailer refuses anyone outside the project team: that
  // means custom SMTP is not configured, and every customer's code fails.
  it('the mailer refuses the address (email_address_not_authorized) → a message AND a Sentry report', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: Object.assign(new Error('Email address not authorized'), { code: 'email_address_not_authorized', status: 400 }),
    });
    await requestCode('signin');
    expect(screen.getByText("We couldn't send a code. Please try again.")).toBeTruthy();
    expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), { context: 'email_otp_send' });
  });

  it('rate limited → a message, not a Sentry report (waiting is not a bug)', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: Object.assign(new Error('rate limit'), { code: 'over_email_send_rate_limit', status: 429 }),
    });
    await requestCode('signin');
    expect(screen.getByText('Too many codes requested. Wait a minute, then try again.')).toBeTruthy();
    expect(sentryModule.reportError).not.toHaveBeenCalled();
  });
});

describe('demo mode (App Review)', () => {
  async function tapTitle(times: number) {
    for (let i = 0; i < times; i += 1) {
      await fireEvent.press(screen.getByText(/Save your/));
    }
  }

  it('seven taps on the title → demo user, straight to the gate', async () => {
    const navigation = await renderAuth('signup');
    await tapTitle(7);

    expect(alertSpy).toHaveBeenCalledWith('Demo Mode Activated', expect.any(String), expect.any(Array));
    expect(capturedEvents()).toContain('demo_mode_activated');
    const buttons = alertSpy.mock.calls[0][2] as { text: string; onPress: () => void }[];
    await act(async () => buttons.find((b) => b.text === 'Continue')!.onPress());

    expect(useAuthStore.getState().isDemoUser).toBe(true);
    expect(navigation.navigate).toHaveBeenCalledWith('Loading');
    neverRoot(navigation);
  });

  it('six taps → nothing', async () => {
    await renderAuth('signup');
    await tapTitle(6);
    expect(alertSpy).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isDemoUser).toBe(false);
  });
});

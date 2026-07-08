import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AntDesign } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { usePostHog } from 'posthog-react-native';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import type { Session } from '@supabase/supabase-js';
import { signInWithGoogle, signInWithApple } from '../../services/authService';
import { hasUserCompletedOnboarding } from '../../services/onboardingService';
import { Colors } from '../../constants/theme';
import { identifyUserWithOnboarding, trackAuthAttempted, trackAuthAbandoned } from '../../lib/analytics';
import { reportError } from '../../config/sentry';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Auth'>;

export const AuthScreen: React.FC<Props> = ({ navigation, route }) => {
  const onboardingStore = useOnboardingStore();
  const { setAuthMethod, markAuthReached } = onboardingStore;
  const { setUser, setSession, setDemoUser, signOut } = useAuthStore();
  const posthog = usePostHog();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Two entry paths, one code path:
  //   'signup' (default): user reached here from end-of-onboarding. Their
  //     answers are in onboardingStore and need to be persisted after signin.
  //     Post-signin routes to Loading (which saves onboarding + shows paywall).
  //   'signin': user tapped "I already have an account" on Welcome. No
  //     onboarding answers to save. Post-signin routes to Root if they've
  //     completed onboarding before, or UserType to start fresh if not.
  const mode: 'signin' | 'signup' = route.params?.mode ?? 'signup';
  const userTypeAnalytics: 'new' | 'returning' = mode === 'signin' ? 'returning' : 'new';

  // Only mark auth-reached for signup mode — this flag gates the resume-into-
  // Auth path on next launch. Marking it for signin-first users would break
  // that resume logic.
  //
  // Do NOT fire onboarding_completed here. The prior version did, which
  // inflated PostHog funnels because parked users get resumed back to Auth
  // via SplashScreen every launch and would re-emit the event on every
  // mount (Fable review #8). The real "onboarding completed" moment is
  // after a successful signup-mode signin — see handlePostSignin.
  useEffect(() => {
    if (mode === 'signup') {
      markAuthReached();
    }
  }, [mode]);

  // Post-signin routing shared by both providers. Prefers routing to Root
  // for anyone whose account already has completed onboarding data — no
  // matter which mode they entered from. That's what fixes the "clicked
  // 'already have account' but got sent to onboarding" bug.
  //
  // Three onboarding-check outcomes, each handled distinctly. Do NOT collapse
  // 'error' into 'no_onboarding' — a network blip during the check would
  // re-run onboarding and let a re-run overwrite the user's real answers
  // (Fable review #2, same bug class as the v1.0.0 paywall bypass).
  const handlePostSignin = async (userId: string) => {
    const result = await hasUserCompletedOnboarding(userId);

    if (result.status === 'error') {
      if (__DEV__) console.error('[Auth] onboarding check failed:', result.error);
      reportError(result.error, {
        context: 'post_signin_onboarding_check',
        user_id: userId,
      });
      // The user is now signed in but we can't tell if they have onboarding
      // data. Do NOT default to signup — that would overwrite their real
      // answers if they did have data. Sign them out to bounce back to
      // Welcome and let them retry; the alternative (leaving them signed
      // in on a broken screen) is worse.
      Alert.alert(
        "Couldn't verify your account",
        "We couldn't check your account — please check your connection and sign in again.",
        [{ text: 'OK' }],
      );
      await signOut();
      return;
    }

    if (result.status === 'has_onboarding') {
      if (__DEV__) console.log('[Auth] returning user, navigating to Loading (the gate)');

      // Clear the local onboarding scratchpad + the has-reached-auth flag.
      //
      // Why clear the flag: it was set on this AuthScreen mount (in signup
      // mode, we call markAuthReached() so the resume-from-Splash flow
      // treats them as onboarded). But this specific user already had a
      // Supabase profile — they only got here because we hadn't checked
      // yet. If we leave the flag set, then after a later logout the
      // Splash's routing logic sees hasReachedAuth === true and sends them
      // straight to Auth ('Save your progress') instead of Welcome. That's
      // the flag leak from Fable review #3.
      //
      // Why clear the Zustand scratchpad: the user just rush-tapped through
      // 15 onboarding screens to reach this sign-in button, and those
      // answers are still in the local store. We intentionally DO NOT
      // upsert them to Supabase — the reviewer flagged this as a "silently
      // discarded" bug but on further review we believe the fresh answers
      // are lower-quality than the user's real profile row from a prior
      // session. Overwriting real preferences with quick-tap-throughs is
      // worse than losing the quick-tap-throughs. Decision documented in
      // docs/FABLE_LATEST_REVIEW.md.
      //
      // Both effects rolled into clearState() which multiRemove's
      // ONBOARDING_STORAGE_KEY, LAST_SCREEN_KEY, HAS_REACHED_AUTH_KEY and
      // resets the Zustand slice to initial state.
      try {
        await onboardingStore.clearState();
      } catch (e) {
        // Non-fatal — the user is signed in and we're routing them into
        // the gate. Log it but don't block them.
        reportError(e instanceof Error ? e : new Error(String(e)), {
          context: 'post_signin_clear_state',
        });
      }

      // INVARIANT: AuthScreen never routes to Root. Every entry to Root goes
      // through the Loading gate (LoadingScreen), which is the single
      // subscription checkpoint under the hard-paywall model — see
      // docs/PAYWALL_MODEL.md, load-bearing invariant #1. The prior code
      // sent returning users straight to Root here, which was the sign-in
      // bypass: a returning-but-unsubscribed account reached the LearnScreen
      // without ever passing the paywall (SPEC-01 R1). Routing to Loading
      // closes it — Loading short-circuits to Root for entitled users and
      // presents the paywall for everyone else.
      //
      // Note we cleared onboardingStore above, so LoadingScreen sees a null
      // userType and takes its cold-launch path: it skips the onboarding
      // upsert and goes straight to the gate. That's exactly what we want
      // for a returning user who already has a profile row.
      navigation.replace('Loading');
      return;
    }

    // result.status === 'no_onboarding'
    if (mode === 'signup') {
      // Signup flow — their onboarding answers are in the Zustand store,
      // Loading will persist them + fire the paywall.
      if (__DEV__) console.log('[Auth] new user from signup flow, navigating to Loading');
      // Fire onboarding_completed HERE (once, at the actual moment
      // onboarding completes with a successful signin), not in the mount
      // effect at the top of the screen. See Fable review #8: firing on
      // mount inflated funnels because parked users get resumed to Auth
      // and re-emitted the event on every launch.
      posthog.capture('onboarding_completed');
      navigation.replace('Loading');
    } else {
      // Signin flow but no onboarding on record — must be a NEW user who
      // clicked "I already have an account" by mistake, OR a user who signed
      // up on a different device and hasn't done onboarding here. Either
      // way, run them through onboarding.
      if (__DEV__) console.log('[Auth] signin mode with no onboarding — starting onboarding');
      navigation.replace('UserType');
    }
  };

  // Shared provider sign-in body. Google and Apple flows were identical
  // apart from the provider tag and which signIn* service to call —
  // extracted to a single helper (Fable review 🟡 dedupe).
  const runProviderSignIn = async (
    provider: 'google' | 'apple',
    doSignIn: () => Promise<Session | null>,
    userLabel: 'Google' | 'Apple',
  ) => {
    const attemptedContext = userTypeAnalytics === 'new' ? 'new_user' : 'returning_user';
    try {
      setIsLoading(true);
      setLoadingProvider(provider);
      setAuthMethod(provider);
      trackAuthAttempted(provider, attemptedContext);

      const session = await doSignIn();

      if (session) {
        setUser(session.user);
        setSession(session);
        identifyUserWithOnboarding(session.user.id, onboardingStore, mode);
        posthog.capture('user_signed_in', {
          auth_method: provider,
          user_type: userTypeAnalytics,
        });
        await handlePostSignin(session.user.id);
      } else {
        trackAuthAbandoned(provider, attemptedContext, 'no_session_returned');
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error: any) {
      if (__DEV__) console.error(`${userLabel} sign-in error:`, error);
      trackAuthAbandoned(provider, attemptedContext, 'error');
      posthog.captureException(error instanceof Error ? error : new Error(String(error)), {
        auth_method: provider,
        screen: 'AuthScreen',
      });
      reportError(error, { auth_method: provider, screen: 'AuthScreen' });
      setIsLoading(false);
      setLoadingProvider(null);
      Alert.alert(
        'Sign In Failed',
        error.message || `Could not sign in with ${userLabel}. Please try again.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleGoogleSignIn = () => runProviderSignIn('google', signInWithGoogle, 'Google');
  const handleAppleSignIn = () => runProviderSignIn('apple', signInWithApple, 'Apple');

  const handleTitlePress = () => {
    // Clear existing timer
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Activate demo mode after 7 taps
    if (newTapCount >= 7) {
      setTapCount(0);
      // Track activation volume. Fable review #13 flagged that we need to
      // monitor this in prod — expected ~1-5 activations/week (Apple
      // reviewers only). A spike means end users have discovered the
      // gesture and we should remove it before Apple notices in review.
      posthog.capture('demo_mode_activated');
      Alert.alert(
        'Demo Mode Activated',
        'You now have full access to all premium features for review purposes.',
        [
          {
            text: 'Continue',
            onPress: () => {
              setAuthMethod('demo');
              setDemoUser();
              navigation.navigate('Loading');
            },
          },
        ]
      );
    } else {
      // Reset tap count after 3 seconds of inactivity
      tapTimerRef.current = setTimeout(() => {
        setTapCount(0);
      }, 3000);
    }
  };

  return (
    <OnboardingContainer
      currentStep={15}
      showBackButton={mode === 'signin'}
      onBack={mode === 'signin' ? () => navigation.goBack() : undefined}
      scrollable={true}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity onPress={handleTitlePress} activeOpacity={0.8}>
            <Text style={styles.title}>
              {mode === 'signin' ? 'Welcome back' : 'Save your progress'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.description}>
            {mode === 'signin'
              ? 'Sign in to continue your parenting journey.'
              : "We'll save your preferences and progress securely."}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            {loadingProvider === 'google' ? (
              <ActivityIndicator color="#DB4437" />
            ) : (
              <>
                <View style={styles.googleIconContainer}>
                  <AntDesign name="google" size={22} color="#DB4437" />
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {loadingProvider === 'apple' ? (
            <View style={styles.appleLoadingContainer}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}
        </View>

        {mode === 'signin' && (
          // Hint to prevent duplicate accounts. Apple Private Relay gives a
          // xxx@privaterelay.appleid.com email that never matches a Google
          // real email, so Supabase can't auto-link a user who signed up
          // with Apple and later tries Google — they end up with two
          // accounts, losing progress + subscription. There is no
          // API-level fix (Apple deliberately hides the real email). Best
          // practice per Supabase docs + Spotify/Duolingo pattern: nudge
          // the user to pick the same provider. Rare cases (~<5% who
          // ignore the hint) are handled via support merge later.
          <Text style={styles.providerHint}>
            💡 Use the same option you signed up with to keep your progress.
          </Text>
        )}

        <Text style={styles.terms}>
          By continuing you agree to our{' '}
          <Text onPress={() => Linking.openURL('https://mandeepv.github.io/kinderwell-legal/terms.html')} style={{ textDecorationLine: 'underline' }}>Terms</Text>
          {' '}and{' '}
          <Text onPress={() => Linking.openURL('https://mandeepv.github.io/kinderwell-legal/privacy.html')} style={{ textDecorationLine: 'underline' }}>Privacy Policy</Text>
        </Text>
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  content: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 128,
    height: 128,
    backgroundColor: Colors.primary,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
    paddingHorizontal: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F1F1F',
    marginLeft: 12,
    letterSpacing: 0.2,
  },
  appleButton: {
    width: '100%',
    height: 56,
  },
  appleLoadingContainer: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  terms: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

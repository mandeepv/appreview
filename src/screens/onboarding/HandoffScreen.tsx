/**
 * The purchase handoff (SPEC-21): a kinderwell.app buyer opens the app
 * already signed in to the account that paid.
 *
 * Three ways in, one screen:
 *   - OFFER. A fresh install, nobody signed in, a URL on the clipboard
 *     (SplashScreen decides). The welcome page's "Get Kinderwell" copied the
 *     buyer's setup link before sending them to the App Store, so this asks
 *     for one tap on Apple's Paste button. Paste reads the clipboard with no
 *     permission alert, because the tap is the permission.
 *   - LINK. A handoff link opened the app (the email's or the welcome page's
 *     "Open Kinderwell", cold or warm). The key is already in the store, so
 *     the screen goes straight to "Signing you in".
 *   - A link arriving while this screen is up is picked up the same way.
 *
 * Then: redeem the key (the server claims it, once), and ONLY THEN deal with
 * whoever is signed in, so a dead link signs nobody out. Then the gate:
 * Loading, never Root (INVARIANTS #1), which finds the web entitlement and
 * opens Learn — or shows the paywall to a buyer refunded since.
 *
 * Every failure ends at email sign-in (today's path), with words that say
 * which failure it was. Nothing here mentions buying, the website or prices
 * (INVARIANTS #26): every organic user with a link on their clipboard can
 * see the offer once.
 *
 * The key lives in memory only (handoffStore, a ref for a retry) and goes
 * only to redeem-handoff (INVARIANTS #29).
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClipboardPasteButton, type PasteEventPayload } from 'expo-clipboard';
import type { OnboardingStackParamList } from '../../navigation/types';
import { RichHeadline, ContinuePill } from '../../components/onboarding/OnboardingScreen';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useHandoffStore, markHandoffPromptDone, type HandoffSource } from '../../store/handoffStore';
import { parseHandoffUrl } from '../../lib/handoffLink';
import { clearPastedLink, pasteButtonAvailable, readClipboardText } from '../../lib/handoffSources';
import { redeemHandoffKey, verifyHandoffToken, type HandoffResult } from '../../services/handoffService';
import { resolveHandoffAccount } from '../../navigation/routingPolicy';
import { identifyUserWithOnboarding, safeCapture } from '../../lib/analytics';
import { resetPostHog } from '../../config/posthog';
import { reportError } from '../../config/sentry';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingLayout as L,
  oInk,
} from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Handoff'>;

type Failure = Exclude<HandoffResult, 'ok'>;
type Phase =
  | { kind: 'offer' }
  | { kind: 'redeeming' }
  | { kind: 'failed'; result: Failure; canRetry: boolean };

/**
 * What a failed link says. The second line always offers the way that still
 * works — the email the buyer paid with — and the button under it is the
 * sign-in screen's own label, "Continue with Email" (INVARIANTS #27).
 */
const FAILURE_COPY: Record<Failure, { headline: string; body: string }> = {
  expired: { headline: 'This link has *expired*.', body: 'Sign in with the email you used.' },
  used: { headline: 'This link has *already been used*.', body: 'Sign in with the email you used.' },
  unknown: { headline: "This link *isn't valid*.", body: 'Sign in with the email you used.' },
  not_entitled: { headline: "We *couldn't* sign you in.", body: 'Sign in with the email you used.' },
  rate_limited: {
    headline: 'Too many *tries*.',
    body: 'Wait a few minutes, or sign in with the email you used.',
  },
  error: {
    headline: "We *couldn't* sign you in.",
    body: 'Check your connection and try again, or sign in with the email you used.',
  },
};

export const HandoffScreen: React.FC<Props> = ({ navigation }) => {
  const pendingKey = useHandoffStore((s) => s.pendingKey);
  const [phase, setPhase] = useState<Phase>(() =>
    useHandoffStore.getState().pendingKey ? { kind: 'redeeming' } : { kind: 'offer' },
  );
  const busyRef = useRef(false);
  // Kept only for "Try again" after a failure the server undid (error) or
  // refused before looking (rate_limited). Any other failure spent or never
  // matched the key, so a retry could only fail again.
  const retryRef = useRef<{ key: string; source: HandoffSource } | null>(null);

  // The offer is counted once, when it is actually on screen.
  useEffect(() => {
    if (phase.kind === 'offer') safeCapture('handoff_paste_offered');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redeem = async (key: string, source: HandoffSource) => {
    if (busyRef.current) return;
    busyRef.current = true;
    retryRef.current = null;
    setPhase({ kind: 'redeeming' });
    // A redeem — whatever its outcome — answers the paste offer for good.
    void markHandoffPromptDone();

    const fail = (result: Failure, retryable = true) => {
      safeCapture('handoff_redeemed', { result, source });
      const canRetry = retryable && (result === 'error' || result === 'rate_limited');
      retryRef.current = canRetry ? { key, source } : null;
      setPhase({ kind: 'failed', result, canRetry });
      busyRef.current = false;
      // A newer link tapped while this one was in flight is waiting in the
      // store (the effect below skipped it while busy): try that one now.
      const next = useHandoffStore.getState().take();
      if (next) void redeem(next.key, next.source);
    };

    const outcome = await redeemHandoffKey(key);
    if (outcome.result !== 'ok') {
      fail(outcome.result);
      return;
    }

    const { user, isDemoUser, signOut, setUser, setSession } = useAuthStore.getState();
    const account = resolveHandoffAccount({
      currentUserId: user?.id ?? null,
      isDemoUser,
      buyerUserId: outcome.userId,
    });
    if (account !== 'already_signed_in') {
      try {
        if (account === 'switch_account') {
          // Same steps as every other sign-out on the way to another account
          // (Settings, the paywall's "Use a different account"): close the
          // analytics identity, then sign out, which clears the previous
          // user's cached unlock (INVARIANTS #3). App.tsx leaves navigation
          // alone while this screen is up (shouldResetToWelcomeOnSignOut).
          resetPostHog();
          await signOut();
        }
        const session = await verifyHandoffToken(outcome.tokenHash);
        setUser(session.user);
        setSession(session);
        // ID only: the buyer's answers came from the website, not this store.
        identifyUserWithOnboarding(session.user.id, useOnboardingStore.getState(), 'signin');
        useHandoffStore.getState().setGreetingPending();
      } catch {
        // verifyHandoffToken reported it. The key is spent, so no retry.
        fail('error', false);
        return;
      }
      // The buyer answered the questions on the website (or skipped them);
      // any half-finished answers on this device would otherwise resume the
      // questions on the next launch and end at a second sign-in (BACKLOG
      // #27). Same clear AuthScreen does for a returning user.
      try {
        await useOnboardingStore.getState().clearState();
      } catch (error) {
        reportError(error instanceof Error ? error : new Error(String(error)), {
          context: 'handoff_clear_onboarding',
        });
      }
    }

    safeCapture('handoff_redeemed', { result: 'ok', source });
    if (source === 'clipboard') void clearPastedLink();
    // The gate decides: web entitled → Root; refunded meanwhile → paywall.
    navigation.replace('Loading');
  };

  // A key in the store — at mount (a link opened the app) or arriving while
  // this screen is up (a link tapped from Mail) — is redeemed straight away.
  useEffect(() => {
    if (!pendingKey || busyRef.current) return;
    const taken = useHandoffStore.getState().take();
    if (taken) void redeem(taken.key, taken.source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingKey]);

  const handlePasted = (text: string | null) => {
    const key = parseHandoffUrl(text);
    safeCapture('handoff_paste_result', { matched: key !== null });
    if (!key) {
      // Someone else's link (or nothing): this was never a buyer's setup.
      void markHandoffPromptDone();
      navigation.replace('Welcome');
      return;
    }
    void redeem(key, 'clipboard');
  };

  const handlePasteButton = (data: PasteEventPayload) => {
    handlePasted(data.type === 'text' ? data.text : null);
  };

  // iOS 15 has no Paste button; reading from a tap shows iOS's own prompt.
  const handleFallbackPaste = async () => {
    handlePasted(await readClipboardText());
  };

  const handleNotNow = () => {
    void markHandoffPromptDone();
    // Whoever was signed in when a link failed goes back through their own
    // gate; a signed-out visitor starts at Welcome.
    if (useAuthStore.getState().user) navigation.replace('Loading');
    else navigation.replace('Welcome');
  };

  const handleTryAgain = () => {
    const retry = retryRef.current;
    if (retry) void redeem(retry.key, retry.source);
  };

  // Today's v1.3.0 path: email sign-in, opened straight at the address field.
  // Whoever is signed in signs out first — a different account is about to
  // sign in (INVARIANTS #3).
  const handleContinueWithEmail = async () => {
    if (useAuthStore.getState().user) {
      try {
        resetPostHog();
        await useAuthStore.getState().signOut();
      } catch (error) {
        reportError(error instanceof Error ? error : new Error(String(error)), {
          context: 'handoff_fallback_sign_out',
        });
        return;
      }
    }
    navigation.reset({
      index: 1,
      routes: [{ name: 'Welcome' }, { name: 'Auth', params: { mode: 'signin', startWith: 'email' } }],
    });
  };

  if (phase.kind === 'redeeming') {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={[styles.safe, styles.centred]}>
          <ActivityIndicator color={C.forest} size="large" />
          <RichHeadline style={styles.waiting}>Signing you *in*…</RichHeadline>
        </SafeAreaView>
      </View>
    );
  }

  const failure = phase.kind === 'failed' ? FAILURE_COPY[phase.result] : null;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.grow} />
          <Text style={styles.wordmark}>Kinderwell</Text>
          <RichHeadline style={styles.headline}>
            {failure ? failure.headline : 'Welcome to *Kinderwell*.'}
          </RichHeadline>
          <Text style={styles.lede}>{failure ? failure.body : 'Tap Paste to finish setting up.'}</Text>
          <View style={styles.grow} />

          <View>
            {failure ? (
              <ContinuePill label="Continue with Email" onPress={handleContinueWithEmail} />
            ) : pasteButtonAvailable() ? (
              // Apple's control: its label ("Paste") and icon are fixed by iOS
              // and localised by it. Sized explicitly — it renders nothing
              // without a width and height.
              <ClipboardPasteButton
                testID="handoff-paste"
                onPress={handlePasteButton}
                acceptedContentTypes={['url', 'plain-text']}
                backgroundColor={C.forest}
                foregroundColor={C.cream}
                cornerStyle="capsule"
                displayMode="iconAndLabel"
                style={styles.pasteButton}
              />
            ) : (
              <ContinuePill label="Paste" onPress={handleFallbackPaste} />
            )}

            {phase.kind === 'failed' && phase.canRetry ? (
              <Pressable onPress={handleTryAgain} accessibilityRole="button" style={styles.quietAction}>
                <Text style={styles.quietActionText}>Try again</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={handleNotNow} accessibilityRole="button" style={styles.quietAction}>
              <Text style={styles.quietActionText}>Not now</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

// WelcomeScreen's geometry: wordmark, serif headline and lede on one left
// edge, the action pinned to the bottom. This screen stands where Welcome
// would, so it should read as the same place.
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },
  safe: { flex: 1 },
  centred: { alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: L.screenPad, paddingTop: 34, paddingBottom: 34 },
  grow: { flex: 1, minHeight: 20 },
  wordmark: {
    fontFamily: F.serif,
    fontSize: 22,
    letterSpacing: 0.3,
    color: C.forest,
    marginBottom: 22,
  },
  headline: {
    fontFamily: F.serif,
    fontSize: T.h1,
    lineHeight: T.h1 * 1.22,
    letterSpacing: -0.45,
    color: C.ink,
  },
  lede: {
    fontFamily: F.serif,
    fontSize: T.body,
    lineHeight: T.body * 1.62,
    color: oInk(0.78),
    marginTop: 14,
    maxWidth: 310,
  },
  waiting: {
    fontFamily: F.serif,
    fontSize: T.h3,
    color: C.ink,
    marginTop: 22,
  },
  pasteButton: { width: '100%', height: L.buttonHeight },
  quietAction: { alignSelf: 'center', marginTop: 18, paddingVertical: 6 },
  quietActionText: {
    fontFamily: F.sansMed,
    fontSize: T.uiSm,
    color: oInk(0.7),
    textDecorationLine: 'underline',
  },
});

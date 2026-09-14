/**
 * The You tab — canvas "Kinderwell You", artboard A.
 *
 * Restyled onto the cream/forest system. Every handler below is v1.2.0's,
 * unchanged: restore, manage, delete, log out and the legal links keep their
 * exact logic, analytics and Alert copy. Only presentation moved.
 *
 * WHAT THE SCREEN SHOWS, and what was deliberately cut from the canvas:
 *
 *   identity   name + "Mom to two children", when we have them (profileSummary
 *              decides; a failed fetch simply renders nothing)
 *   utility    subscription, support, legal — under mono eyebrows, each
 *              destination its own card
 *   account    Log out as a card; Delete account as quiet text below it
 *
 * DENSITY IS DELIBERATE. These four destinations were first compressed onto a
 * single wash panel, which is right for artboard A — but A balances that panel
 * against a large personal half, and ours is two lines after progress, goals
 * and the email address were cut. Without that counterweight the panel read as
 * one thin stripe adrift in whitespace. Carding each row and restoring the
 * section eyebrows gives the screen back the vertical rhythm the old teal
 * version had, without inventing content to fill it.
 *
 * CUT — progress ("31 of 49 sections"). The canvas led with it, but every
 * denominator in this app grows: adding lessons would silently move a parent
 * further from "done" than they were yesterday, which punishes them for our
 * content shipping. A streak may take this slot later; the placeholder below
 * marks where.
 *
 * CUT — the email address. With Apple's Hide My Email it is a relay alias
 * (a1b2c3@privaterelay.appleid.com) that identifies nobody, and even a real
 * address is a login credential rather than an identity.
 *
 * CUT — the goal chips ("What you're working on"). Read-only chips with no way
 * to edit them are half a feature; they wait for a screen that can change them.
 *
 * Delete account is findable but deliberately NOT the weight of Log out. Apple
 * requires it reachable, not prominent, and giving it equal weight quietly
 * frames deleting your account as a normal thing to do.
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';
import { restorePurchases } from '../services/purchaseService';
import { deleteAccount } from '../services/authService';
import { getUserOnboardingData } from '../services/onboardingService';
import { resetPostHog } from '../config/posthog';
import { safeCapture } from '../lib/analytics';
import {
  displayName,
  familyLine,
  hasIdentity,
  type ProfileSummaryInput,
} from '../lib/profileSummary';
import { OnboardingColors as C, OnboardingFonts as F, oInk } from '../constants/theme';

/** The row chevron. Drawn rather than an icon font, matching the Path screen. */
function Chevron() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6l6 6-6 6"
        stroke={oInk(0.5)}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A section heading. Mono, uppercase — the eyebrow voice from the Path card. */
function Eyebrow({ children }: { children: string }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

/**
 * One destination, as its own card.
 *
 * Deliberately NOT rows sharing a single panel. Compressed into one block
 * these four reduce to a stripe floating in whitespace — the screen has no
 * large personal half above them to balance against, so each needs to hold
 * its own space the way the old teal cards did.
 */
function Row({
  label,
  detail,
  onPress,
  disabled = false,
}: {
  label: string;
  detail?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed ? { opacity: 0.7 } : null]}
    >
      <Text style={styles.cardLabel}>{label}</Text>
      {detail ? <Text style={styles.cardDetail}>{detail}</Text> : null}
      <Chevron />
    </Pressable>
  );
}

export const SettingsScreen: React.FC = () => {
  const { user, signOut, isDemoUser, isSubscribed } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [profile, setProfile] = useState<ProfileSummaryInput>({});

  /**
   * The identity lines come from Supabase, not the onboarding store.
   *
   * AuthScreen calls clearState() once onboarding finishes, so the local store
   * is empty by the time anyone reaches this tab — the profile row written
   * during onboarding is the only surviving copy.
   *
   * Fails silently by design: an empty profile and a failed fetch both render
   * no header, so there is no error state and nothing to retry.
   */
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      const userId = user?.id;
      // Demo reviewers have no profile row to fetch; they get a fixed header.
      if (userId && !isDemoUser) {
        void (async () => {
          try {
            const data = await getUserOnboardingData(userId);
            if (!alive || !data) return;
            setProfile({
              name: data.name,
              userType: data.user_type,
              childrenCount: data.children_count,
            });
          } catch {
            // Leave the header unrendered. See the note above.
          }
        })();
      }
      return () => {
        alive = false;
      };
    }, [user?.id, isDemoUser]),
  );

  const handleRestorePurchases = async () => {
    // Guard re-entry — tapping twice while restore is in flight must not
    // trigger a second restore. Also tracked separately from delete-account
    // isLoading so those buttons don't lock each other out.
    if (isRestoring) return;

    // Analytics: honest name — fires on tap, before we know outcome.
    safeCapture('restore_purchases_tapped');

    setIsRestoring(true);
    try {
      // The StoreKit-walking restore logic lives in purchaseService so the
      // LoadingScreen escape hatch can share it (SPEC-01 R3). It returns a
      // normalized outcome; this screen maps each outcome to an Alert. It
      // deliberately does NOT flip isSubscribed — App.tsx's
      // onSubscriptionStatusChange listener is the single writer of that flag.
      const result = await restorePurchases();

      switch (result.outcome) {
        case 'restored':
          safeCapture('restore_purchases_completed', { outcome: 'restored' });
          Alert.alert('Restored', 'Your subscription has been restored.');
          break;
        case 'unknown':
          safeCapture('restore_purchases_completed', { outcome: 'unknown' });
          Alert.alert(
            'Still Syncing',
            "We're still checking with the App Store. Please try again in a moment."
          );
          break;
        case 'no_purchases':
          safeCapture('restore_purchases_completed', { outcome: 'no_purchases' });
          Alert.alert(
            'No Purchases Found',
            "No previous purchase was found for this Apple ID. Make sure you're signed in with the Apple ID you used to subscribe."
          );
          break;
        case 'failed':
          safeCapture('restore_purchases_completed', {
            outcome: 'failed',
            error: result.errorMessage,
          });
          Alert.alert(
            'Restore Failed',
            result.errorMessage
              ?? 'Something went wrong. Please check your connection and try again.'
          );
          break;
        case 'threw':
          safeCapture('restore_purchases_completed', { outcome: 'threw' });
          Alert.alert(
            'Restore Failed',
            'Something went wrong. Please check your connection and try again.'
          );
          break;
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const handleManageSubscription = async () => {
    safeCapture('subscription_managed');
    try {
      // Open iOS subscription management
      const url = 'https://apps.apple.com/account/subscriptions';
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Cannot Open',
          'Please manage your subscription in the App Store app.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      if (__DEV__) console.error('Error opening subscription management:', error);
    }
  };

  const handlePrivacyPolicy = async () => {
    const url = 'https://mandeepv.github.io/kinderwell-legal/privacy.html';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to Open Link', 'Please visit https://mandeepv.github.io/kinderwell-legal/privacy.html in your browser.');
      }
    } catch (error) {
      if (__DEV__) console.error('Error opening privacy policy:', error);
    }
  };

  const handleTermsOfService = async () => {
    const url = 'https://mandeepv.github.io/kinderwell-legal/terms.html';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to Open Link', 'Please visit https://mandeepv.github.io/kinderwell-legal/terms.html in your browser.');
      }
    } catch (error) {
      if (__DEV__) console.error('Error opening terms:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          onPress: async () => {
            try {
              safeCapture('user_logged_out');
              resetPostHog();
              await signOut();
            } catch (error) {
              if (__DEV__) console.error('Error logging out:', error);
              Alert.alert('Error', 'Could not log out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    // Single, clear confirmation. Previously we had a two-step "Are you
    // sure? / Are you REALLY sure?" pattern which was theatrical, not
    // informative — added friction without adding clarity. This alert
    // lists actual consequences and, if the user is subscribed, warns
    // them that Apple will keep billing until they cancel in App Store
    // Settings. Required by App Store guideline 5.1.1(v).
    const subscriptionWarning = isSubscribed
      ? '\n\n⚠️ Your Kinderwell subscription is billed by Apple and will continue after account deletion. To stop billing, cancel your subscription in Settings → Apple ID → Subscriptions BEFORE deleting.'
      : '';

    Alert.alert(
      'Delete your account?',
      `This permanently deletes your Kinderwell account and all your data (progress, preferences, children). This cannot be undone.${subscriptionWarning}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            // Fire the "attempted" event immediately for funnel analysis
            // (how many users tap Delete Account?). The "confirmed" event
            // only fires after the operation actually succeeds — Fable
            // review #8: prior code fired 'account_deleted' before
            // deleteAccount() ran, so a network / server failure got
            // logged as a successful deletion in PostHog.
            safeCapture('account_delete_attempted', {
              is_demo_user: isDemoUser,
              was_subscribed: isSubscribed,
            });

            try {
              setIsLoading(true);

              if (isDemoUser) {
                // Demo users have no Supabase session — just sign out.
                safeCapture('account_deleted', {
                  is_demo_user: true,
                  was_subscribed: isSubscribed,
                });
                resetPostHog();
                await signOut();
              } else {
                await deleteAccount();
                // Only after the API round-trip succeeds. If deleteAccount
                // throws, we skip this and hit the catch below.
                safeCapture('account_deleted', {
                  is_demo_user: false,
                  was_subscribed: isSubscribed,
                });
                resetPostHog();
                Alert.alert(
                  'Account deleted',
                  'Your account and all data have been deleted.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              if (__DEV__) console.error('Error deleting account:', error);
              // Track the failure separately so we can measure the
              // failure rate. Attributed to the still-alive user (posthog
              // hasn't been reset yet).
              safeCapture('account_delete_failed', {
                is_demo_user: isDemoUser,
                was_subscribed: isSubscribed,
                error: error instanceof Error ? error.message : String(error),
              });
              Alert.alert(
                'Delete Failed',
                'Could not delete account. Please try again or contact support.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = async () => {
    const email = 'support@example.com';
    const subject = 'Support Request';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Contact Support',
          `Please email us at ${email}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      if (__DEV__) console.error('Error opening email:', error);
    }
  };

  // Demo reviewers get a fixed, honest header rather than a Supabase lookup
  // they have no row for.
  const identity: ProfileSummaryInput = isDemoUser
    ? { name: 'App Reviewer' }
    : profile;
  const name = displayName(identity);
  const family = familyLine(identity);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Rendered only when there is something true to say. An empty profile
            and a failed fetch look identical here, on purpose. */}
        {hasIdentity(identity) ? (
          <View style={styles.identity}>
            {name ? <Text style={styles.name}>{name}</Text> : null}
            {family ? <Text style={styles.family}>{family}</Text> : null}
            {isDemoUser ? <Text style={styles.demoNote}>Demo mode · full access</Text> : null}
          </View>
        ) : null}

        {/* PARKED — the streak slot. The canvas put progress counts here and
            they were cut: every denominator in this app grows, so "31 of 49"
            moves backwards each time content ships. A streak counts up and
            does not have that problem, which is why it is the likelier tenant.
            Active days are already being recorded (src/lessons/streak.ts), so
            whatever lands here will have real history behind it.

        <View style={styles.record}>
          <Text style={styles.recordEyebrow}>YOUR STREAK</Text>
          ...
        </View>
        */}

        <Eyebrow>SUBSCRIPTION</Eyebrow>
        <Row
          label="Manage subscription"
          detail={isSubscribed ? 'Active' : undefined}
          onPress={handleManageSubscription}
          disabled={isLoading}
        />
        <Row
          label={isRestoring ? 'Restoring…' : 'Restore purchases'}
          onPress={handleRestorePurchases}
          disabled={isLoading || isRestoring}
        />

        <Eyebrow>SUPPORT</Eyebrow>
        <Row label="Contact support" onPress={handleContactSupport} />

        <Eyebrow>LEGAL</Eyebrow>
        <Row label="Privacy policy" onPress={handlePrivacyPolicy} />
        <Row label="Terms of service" onPress={handleTermsOfService} />

        <View style={styles.spacer} />

        <Pressable
          onPress={handleLogout}
          disabled={isLoading}
          accessibilityRole="button"
          style={({ pressed }) => [styles.logout, pressed ? { opacity: 0.85 } : null]}
        >
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>

        {/* Findable, deliberately not the weight of Log out. */}
        <Pressable
          onPress={handleDeleteAccount}
          disabled={isLoading}
          accessibilityRole="button"
          style={({ pressed }) => [styles.delete, pressed ? { opacity: 0.6 } : null]}
        >
          <Text style={styles.deleteLabel}>Delete account</Text>
        </Pressable>

        {/* Read from Constants so this stays in sync with app.json — no
            more hardcoded "v1.0.0" while the app actually shipped 1.1.0
            (Fable review #14). Copyright year derived from Date so we
            stop needing to remember to bump it. */}
        <Text style={styles.version}>
          Kinderwell v{Constants.expoConfig?.version ?? '?'}
          {Constants.expoConfig?.ios?.buildNumber
            ? ` (${Constants.expoConfig.ios.buildNumber})`
            : ''}
          {' · © '}
          {new Date().getFullYear()} Kinderwell
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },
  scroll: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 20, paddingBottom: 34 },

  identity: { paddingBottom: 22, borderBottomWidth: 1, borderBottomColor: oInk(0.12) },
  // Light serif at display size — the masthead voice from the Path screen.
  name: { fontFamily: F.serifLight, fontSize: 38, lineHeight: 38 * 1.1, color: C.ink },
  family: {
    fontFamily: F.serif,
    fontSize: 18,
    lineHeight: 18 * 1.45,
    color: oInk(0.82),
    marginTop: 8,
  },
  demoNote: { fontFamily: F.sans, fontSize: 14, color: oInk(0.62), marginTop: 9 },

  eyebrow: {
    fontFamily: F.monoMed,
    fontSize: 12,
    letterSpacing: 12 * 0.06,
    color: oInk(0.62),
    marginTop: 26,
    marginBottom: 12,
  },

  // Each destination is its own card on the wash, with a real gap after it.
  // The whole screen is four rows and two buttons; compressed into a single
  // panel that reads as one thin stripe adrift in whitespace.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.wash,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 19,
    marginBottom: 10,
  },
  cardLabel: { flex: 1, fontFamily: F.sansMed, fontSize: 16, color: C.ink },
  cardDetail: { fontFamily: F.sans, fontSize: 14, color: oInk(0.6) },

  // Pushes the account actions to the bottom on a tall screen, and simply
  // scrolls on a short one.
  spacer: { flex: 1, minHeight: 34 },

  // Matches the card rhythm above rather than introducing a pill: this is the
  // last item in the same list, not a call to action.
  logout: {
    backgroundColor: C.wash,
    borderRadius: 18,
    paddingVertical: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutLabel: { fontFamily: F.sansSemi, fontSize: 16, color: C.ink },

  // No red exists in this palette, so "destructive" is expressed as the palest
  // ink on the screen: findable, clearly not routine, never alarming.
  delete: { alignItems: 'center', paddingVertical: 16 },
  deleteLabel: { fontFamily: F.sans, fontSize: 14, color: oInk(0.48) },

  version: {
    fontFamily: F.sans,
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: oInk(0.42),
    textAlign: 'center',
    paddingTop: 4,
  },
});

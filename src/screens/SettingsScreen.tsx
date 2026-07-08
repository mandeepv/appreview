import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { usePostHog } from 'posthog-react-native';
import { useAuthStore } from '../store/authStore';
import { restorePurchases } from '../services/purchaseService';
import { deleteAccount } from '../services/authService';
import { resetPostHog } from '../config/posthog';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

export const SettingsScreen: React.FC = () => {
  const { user, signOut, isDemoUser, isSubscribed } = useAuthStore();
  const posthog = usePostHog();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestorePurchases = async () => {
    // Guard re-entry — tapping twice while restore is in flight must not
    // trigger a second restore. Also tracked separately from delete-account
    // isLoading so those buttons don't lock each other out.
    if (isRestoring) return;

    // Analytics: honest name — fires on tap, before we know outcome.
    posthog.capture('restore_purchases_tapped');

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
          posthog.capture('restore_purchases_completed', { outcome: 'restored' });
          Alert.alert('Restored', 'Your subscription has been restored.');
          break;
        case 'unknown':
          posthog.capture('restore_purchases_completed', { outcome: 'unknown' });
          Alert.alert(
            'Still Syncing',
            "We're still checking with the App Store. Please try again in a moment."
          );
          break;
        case 'no_purchases':
          posthog.capture('restore_purchases_completed', { outcome: 'no_purchases' });
          Alert.alert(
            'No Purchases Found',
            "No previous purchase was found for this Apple ID. Make sure you're signed in with the Apple ID you used to subscribe."
          );
          break;
        case 'failed':
          posthog.capture('restore_purchases_completed', {
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
          posthog.capture('restore_purchases_completed', { outcome: 'threw' });
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
    posthog.capture('subscription_managed');
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
              posthog.capture('user_logged_out');
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
            posthog.capture('account_delete_attempted', {
              is_demo_user: isDemoUser,
              was_subscribed: isSubscribed,
            });

            try {
              setIsLoading(true);

              if (isDemoUser) {
                // Demo users have no Supabase session — just sign out.
                posthog.capture('account_deleted', {
                  is_demo_user: true,
                  was_subscribed: isSubscribed,
                });
                resetPostHog();
                await signOut();
              } else {
                await deleteAccount();
                // Only after the API round-trip succeeds. If deleteAccount
                // throws, we skip this and hit the catch below.
                posthog.capture('account_deleted', {
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
              posthog.capture('account_delete_failed', {
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
    const email = 'kinderwellteam@gmail.com';
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={32} color={Colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {isDemoUser ? 'App Reviewer' : (user?.email || 'User')}
              </Text>
              <Text style={styles.profileEmail}>
                {isDemoUser ? 'Demo Mode - Full Access' : user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleManageSubscription}
            disabled={isLoading}
          >
            <Ionicons name="card-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.menuItemText}>Manage Subscription</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleRestorePurchases}
            disabled={isLoading || isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="refresh-outline" size={24} color={Colors.textSecondary} />
            )}
            <Text style={styles.menuItemText}>
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleContactSupport}
          >
            <Ionicons name="mail-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.menuItemText}>Contact Support</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePrivacyPolicy}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.menuItemText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleTermsOfService}
          >
            <Ionicons name="document-text-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.menuItemText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors.error} />
            <Text style={[styles.menuItemText, styles.logoutText]}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.deleteItem]}
            onPress={handleDeleteAccount}
            disabled={isLoading}
          >
            <Ionicons name="trash-outline" size={24} color={Colors.error} />
            <Text style={[styles.menuItemText, styles.deleteText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          {/* Read from Constants so this stays in sync with app.json — no
              more hardcoded "v1.0.0" while the app actually shipped 1.1.0
              (Fable review #14). Copyright year derived from Date so we
              stop needing to remember to bump it. */}
          <Text style={styles.appInfoText}>
            Kinderwell v{Constants.expoConfig?.version ?? '?'}
            {Constants.expoConfig?.ios?.buildNumber ? ` (${Constants.expoConfig.ios.buildNumber})` : ''}
          </Text>
          <Text style={styles.appInfoText}>© {new Date().getFullYear()} Kinderwell</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  menuItemText: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.md,
  },
  logoutItem: {
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  logoutText: {
    color: Colors.error,
  },
  deleteItem: {
    backgroundColor: Colors.error + '10',
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  deleteText: {
    color: Colors.error,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  appInfoText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
});

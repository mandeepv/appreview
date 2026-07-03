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
import { usePostHog } from 'posthog-react-native';
import { SuperwallExpoModule } from 'expo-superwall';
import { useAuthStore } from '../store/authStore';
import { deleteAccount } from '../services/authService';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

export const SettingsScreen: React.FC = () => {
  const { user, signOut, isDemoUser } = useAuthStore();
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
      // Superwall's getSubscriptionStatus() re-syncs with StoreKit — checking
      // Apple's servers for the current entitlement state under the signed-in
      // Apple ID. "success" here means "sync completed" NOT "restored
      // something" — we still have to check the returned status.
      const status = await SuperwallExpoModule.getSubscriptionStatus();
      const isActive = status?.status === 'ACTIVE';

      // We deliberately DO NOT call setIsSubscribed(true) here. The app-level
      // onSubscriptionStatusChange listener in App.tsx is the single source of
      // truth for isSubscribed; letting the restore also write it creates a
      // race condition between two writers.

      if (isActive) {
        posthog.capture('restore_purchases_completed', { outcome: 'restored' });
        Alert.alert('Restored', 'Your subscription has been restored.');
      } else {
        // Wrong Apple ID is the #1 real cause of "no purchases found." Hint at
        // it so the user knows how to recover instead of assuming the app is broken.
        posthog.capture('restore_purchases_completed', { outcome: 'no_purchases' });
        Alert.alert(
          'No Purchases Found',
          "No previous purchase was found for this Apple ID. Make sure you're signed in with the Apple ID you used to subscribe."
        );
      }
    } catch (error) {
      if (__DEV__) console.error('Restore failed:', error);
      posthog.capture('restore_purchases_completed', { outcome: 'failed' });
      Alert.alert(
        'Restore Failed',
        'Something went wrong. Please check your connection and try again.'
      );
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
              posthog.reset();
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
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your progress and data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => confirmDeleteAccount(),
          style: 'destructive',
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Final Confirmation',
      'This is your last chance. Are you absolutely sure you want to delete your account and all data?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Delete Everything',
          onPress: async () => {
            try {
              setIsLoading(true);
              posthog.capture('account_deleted', { is_demo_user: isDemoUser });
              if (isDemoUser) {
                // Demo users have no Supabase session — just sign out
                posthog.reset();
                await signOut();
              } else {
                await deleteAccount();
                posthog.reset();
                Alert.alert(
                  'Account Deleted',
                  'Your account and all data have been deleted.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              if (__DEV__) console.error('Error deleting account:', error);
              Alert.alert(
                'Delete Failed',
                'Could not delete account. Please try again or contact support.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoading(false);
            }
          },
          style: 'destructive',
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
          <Text style={styles.appInfoText}>Kinderwell v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2025 Kinderwell</Text>
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

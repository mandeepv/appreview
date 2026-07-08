import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as Sentry from '@sentry/react-native';
import { SuperwallExpoModule } from 'expo-superwall';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';
import { reportError } from '../config/sentry';
import { useOnboardingStore } from '../store/onboardingStore';

// Required for web browser authentication
WebBrowser.maybeCompleteAuthSession();

/**
 * Google Sign-In
 * Using Expo's authentication proxy for better mobile support
 */
export const signInWithGoogle = async () => {
  try {
    // Use the app's custom scheme for development builds
    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: 'kinderwell',
      path: 'auth/callback',
    });

    if (__DEV__) console.log('Redirect URL:', redirectUrl);

    // Start the OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No URL returned from Supabase');

    if (__DEV__) console.log('Opening auth URL...');

    // Open the OAuth URL in the browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl,
      { showInRecents: true }
    );

    if (__DEV__) console.log('Auth session result type:', result.type);

    if (result.type === 'success') {
      const { url } = result;
      if (__DEV__) console.log('Success! Got redirect URL:', url);

      // Parse the URL to check for tokens or code
      const urlObj = new URL(url);

      // Check for authorization code (PKCE flow)
      const code = urlObj.searchParams.get('code');

      // Check for tokens in hash (implicit flow)
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (code) {
        if (__DEV__) console.log('Found authorization code, exchanging for session...');
        // Exchange the code for a session (PKCE flow)
        const { data: sessionData, error: sessionError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
          if (__DEV__) console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (__DEV__) console.log('Session created successfully!');
        return sessionData?.session || null;
      } else if (accessToken) {
        if (__DEV__) console.log('Found tokens in URL, setting session...');
        // Tokens were returned directly (implicit flow)
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

        if (sessionError) {
          if (__DEV__) console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (__DEV__) console.log('Session created successfully!');
        return sessionData?.session || null;
      } else {
        if (__DEV__) console.error('No code or tokens found in URL');
        throw new Error('No authorization code or tokens found in redirect URL');
      }
    } else if (result.type === 'cancel') {
      if (__DEV__) console.log('User cancelled');
      return null;
    }

    return null;
  } catch (error) {
    if (__DEV__) console.error('Error in signInWithGoogle:', error);
    throw error;
  }
};

/**
 * Generate a raw nonce + its SHA-256 hex for Apple Sign In replay protection.
 * See: https://supabase.com/docs/guides/auth/social-login/auth-apple
 *
 * - The SHA-256 is passed to AppleAuthentication.signInAsync so Apple embeds
 *   the hash inside the signed ID token.
 * - The raw nonce is passed to Supabase's signInWithIdToken, which re-hashes
 *   it internally and compares to what the token carries.
 * - If someone intercepts the ID token, they can't reuse it — they don't have
 *   the raw nonce.
 */
async function generateAppleNonce(): Promise<{ raw: string; hashed: string }> {
  const raw = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    // Use randomUUID + timestamp so nonce is unique per attempt.
    `${Crypto.randomUUID()}${Date.now()}`,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
  const hashed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    raw,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
  return { raw, hashed };
}

/**
 * Apple Sign-In
 */
export const signInWithApple = async () => {
  try {
    // Check if Apple Sign-In is available on this device
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple Sign-In is not available on this device');
    }

    // Generate nonce for replay hardening — see generateAppleNonce comments.
    const { raw: rawNonce, hashed: hashedNonce } = await generateAppleNonce();

    // Request Apple authentication. Apple embeds the hashed nonce in the
    // signed identity token so we can verify no one is replaying it.
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    // Verify we received an identity token
    if (!credential.identityToken) {
      throw new Error('Apple Sign-In failed: No identity token received');
    }

    // Sign in to Supabase — pass the RAW nonce; Supabase hashes it internally
    // to compare against what's in the token.
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });

    if (error) throw error;

    // NOTE: we deliberately do NOT capture credential.fullName here.
    //
    // Apple sends the user's real name in the first-authorization
    // credential, and previously (v1.0.0 through mid-v1.1.0) we
    // silently upserted it into user_profiles.name. That felt
    // invasive to end users — they think "I never told Kinderwell my
    // name" and then see their name in the app anyway. Removed
    // 2026-07-05 per user directive: name should come only from what
    // the user explicitly types on the onboarding NameAgeScreen.
    //
    // Consequence: brand-new Apple users who leave the NameAgeScreen
    // field blank end up with name = null in the DB. That's honest —
    // we don't know their name because they didn't tell us. The
    // NameAgeScreen still has a 'Parent' fallback for display, but
    // the LoadingScreen + onboardingService filters keep 'Parent' out
    // of the DB.
    //
    // Existing users who signed up under v1.0.0 already have their
    // Apple-captured name in Supabase; this change doesn't touch them.
    //
    // A follow-up in v1.1.1 (see BACKLOG) will make the name field
    // required on NameAgeScreen, at which point the fallback and
    // filter machinery can be deleted entirely.

    return data.session;
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      // User cancelled the sign-in
      if (__DEV__) console.log('User cancelled Apple Sign-In');
      return null;
    }
    if (__DEV__) console.error('Error signing in with Apple:', error);
    throw error;
  }
};

/**
 * Check if user has an active session
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    if (__DEV__) console.error('Error getting current session:', error);
    return null;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    if (__DEV__) console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Delete user account and all associated data
 * This calls a Supabase Edge Function that uses the service role key
 * to completely delete the user account (GDPR/CCPA compliant)
 */
export const deleteAccount = async () => {
  try {
    // Force a session refresh before invoking. Historically we passed
    // `Authorization: Bearer ${session.access_token}` manually, which used the
    // CACHED access token from getSession() — if it had expired (default 1 h),
    // Supabase's Edge Function JWT verify layer would reject the request with
    // a 401 BEFORE the function ran, so no server-side logs appeared. Refresh
    // first so the Supabase client's internal Authorization header carries a
    // fresh token, and then let functions.invoke() attach it automatically —
    // don't override the header.
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError || !refreshData.session) {
      const err = new Error(`Session refresh failed: ${refreshError?.message ?? 'no session'}`);
      reportError(err, { context: 'delete_account_refresh' });
      throw err;
    }

    const { data, error } = await supabase.functions.invoke('delete-account');

    if (error) {
      if (__DEV__) console.error('Edge Function error:', error);
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: 'delete_account_invoke',
      });
      throw error;
    }

    if (__DEV__) console.log('Account deletion response:', data);

    // Server-side delete succeeded. Now clean up every place the user's
    // identity lives locally so the next signup starts from a truly
    // blank slate — no ghost onboarding progress, no stale Superwall
    // subscription tied to the deleted userId, no Sentry breadcrumbs
    // attributed to a user who no longer exists.
    //
    // Order matters slightly: clear async caches BEFORE signOut() so
    // if AsyncStorage.multiRemove throws we haven't already dropped
    // the auth session (recoverable state).
    //
    // Not cleared here: per-lesson progress in AsyncStorage
    // (`src/utils/*Progress.ts` — namingEmotions, helpingProcessEmotions,
    // serveReturn, lesson5, deepBondMoments, recordingDeepBondMoments).
    // These are keyed per device, not per user, so they persist across
    // account deletions on the same device. Intended behavior — the
    // rationale is that lesson content is educational and progress is
    // an anonymous device-local convenience, not user data. If we ever
    // move progress server-side (e.g. cross-device sync), add
    // `AsyncStorage.multiRemove([...LESSON_PROGRESS_KEYS])` here and
    // the constants file becomes the source of truth for that list.
    try {
      await useOnboardingStore.getState().clearState();
    } catch (e) {
      // Non-fatal — user is deleted, we just failed to wipe local state.
      // Log it but don't throw. The signOut below still runs.
      reportError(e instanceof Error ? e : new Error(String(e)), {
        context: 'delete_account_clear_onboarding',
      });
    }

    try {
      await SuperwallExpoModule.reset();
    } catch (e) {
      reportError(e instanceof Error ? e : new Error(String(e)), {
        context: 'delete_account_superwall_reset',
      });
    }

    // Sign out from Supabase (which wipes the auth session in the
    // Zustand authStore via the onAuthStateChange listener).
    await signOut();

    // Detach the deleted user from Sentry so any future errors on this
    // device don't get attributed to them. Do this LAST because Sentry
    // is our safety net for reporting errors during the delete flow.
    Sentry.setUser(null);
  } catch (error) {
    if (__DEV__) console.error('Error deleting account:', error);
    // Reported above at the site of the specific failure; re-throw so
    // SettingsScreen can show the user-facing alert.
    throw error;
  }
};

import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';

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

    console.log('Redirect URL:', redirectUrl);

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

    console.log('Opening auth URL...');

    // Open the OAuth URL in the browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl,
      { showInRecents: true }
    );

    console.log('Auth session result type:', result.type);

    if (result.type === 'success') {
      const { url } = result;
      console.log('Success! Got redirect URL:', url);

      // Parse the URL to check for tokens or code
      const urlObj = new URL(url);

      // Check for authorization code (PKCE flow)
      const code = urlObj.searchParams.get('code');

      // Check for tokens in hash (implicit flow)
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (code) {
        console.log('Found authorization code, exchanging for session...');
        // Exchange the code for a session (PKCE flow)
        const { data: sessionData, error: sessionError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        console.log('Session created successfully!');
        return sessionData?.session || null;
      } else if (accessToken) {
        console.log('Found tokens in URL, setting session...');
        // Tokens were returned directly (implicit flow)
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        console.log('Session created successfully!');
        return sessionData?.session || null;
      } else {
        console.error('No code or tokens found in URL');
        throw new Error('No authorization code or tokens found in redirect URL');
      }
    } else if (result.type === 'cancel') {
      console.log('User cancelled');
      return null;
    }

    return null;
  } catch (error) {
    console.error('Error in signInWithGoogle:', error);
    throw error;
  }
};

/**
 * Apple Sign-In
 * This will work once you add Apple OAuth credentials to Supabase
 */
export const signInWithApple = async () => {
  try {
    // Check if Apple Sign-In is available on this device
    if (Platform.OS === 'ios') {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Verify we received an identity token
      if (!credential.identityToken) {
        throw new Error('Apple Sign-In failed: No identity token received');
      }

      // Sign in to Supabase with Apple credential
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;

      // Optionally update user profile with Apple user info
      if (credential.fullName && data.user) {
        const fullName = `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim();

        if (fullName) {
          await supabase
            .from('user_profiles')
            .upsert({
              id: data.user.id,
              full_name: fullName,
              email: data.user.email,
            });
        }
      }

      return data.session;
    } else {
      throw new Error('Apple Sign-In is only available on iOS');
    }
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      // User cancelled the sign-in
      console.log('User cancelled Apple Sign-In');
      return null;
    }
    console.error('Error signing in with Apple:', error);
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
    console.error('Error getting current session:', error);
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
    console.error('Error signing out:', error);
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
    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session');
    }

    // Call the Edge Function to delete the account
    // The Edge Function uses the service role key to delete the auth user
    const { data, error } = await supabase.functions.invoke('delete-account', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw error;
    }

    console.log('Account deletion response:', data);

    // Sign out locally (auth user is already deleted on the server)
    await signOut();
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

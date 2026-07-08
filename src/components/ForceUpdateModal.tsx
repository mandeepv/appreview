import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Numeric App Store ID for Kinderwell (public info, from App Store Connect
// → App Information → Apple ID). Never change this without matching what
// Apple has on file.
const APP_STORE_URL = 'https://apps.apple.com/app/kinderwell/id6758403231';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.kinderwell.app';

interface ForceUpdateModalProps {
  visible: boolean;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({ visible }) => {
  const [linkFailed, setLinkFailed] = useState(false);

  // R6: Linking.openURL can reject (no store app available, malformed URL,
  // OS refusal). Since this modal is undismissable, an unhandled rejection
  // here would leave the user with a dead button and no recourse. Wrap it
  // and, on failure, render an inline fallback telling them how to find the
  // app manually.
  const handleUpdate = async () => {
    setLinkFailed(false);
    try {
      await Linking.openURL(Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL);
    } catch (error) {
      if (__DEV__) console.error('[ForceUpdateModal] failed to open store URL:', error);
      setLinkFailed(true);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      // No swipe-to-dismiss on Android.
      onRequestClose={() => {}}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🛠️</Text>
          <Text style={styles.title}>Update required</Text>
          <Text style={styles.body}>
            A new version of Kinderwell is available. Please update to continue.
          </Text>
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={handleUpdate} activeOpacity={0.85}>
            <Text style={styles.buttonText}>
              Update on {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}
            </Text>
          </TouchableOpacity>
          {linkFailed && (
            <Text style={styles.fallback}>
              Couldn't open the {Platform.OS === 'ios' ? 'App Store' : 'Play Store'} — search for "Kinderwell".
            </Text>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fallback: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
});

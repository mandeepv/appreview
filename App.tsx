import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { OnboardingNavigator, OnboardingStackParamList } from './src/navigation/OnboardingNavigator';
import { useAuthStore } from './src/store/authStore';
import { SuperwallProvider } from 'expo-superwall';
import { SUPERWALL_API_KEY } from '@env';

function AppContent() {
  const initialize = useAuthStore(state => state.initialize);
  const user = useAuthStore(state => state.user);
  const navigationRef = useRef<NavigationContainerRef<OnboardingStackParamList>>(null);
  const prevUserRef = useRef(user);
  const isInitialMount = useRef(true);

  useEffect(() => {
    console.log('🚀 Initializing app...');
    initialize();
  }, []);

  // Listen for auth state changes and navigate accordingly
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevUserRef.current = user;
      return;
    }

    // User signed out (had user before, now null)
    if (prevUserRef.current && !user && navigationRef.current?.isReady()) {
      console.log('User signed out, navigating to Welcome screen');
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }

    prevUserRef.current = user;
  }, [user]);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="dark" />
      <OnboardingNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  console.log('📝 Superwall API Key:', SUPERWALL_API_KEY ? `${SUPERWALL_API_KEY.substring(0, 10)}...` : 'MISSING');

  return (
    <SuperwallProvider apiKeys={{ ios: SUPERWALL_API_KEY }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppContent />
      </GestureHandlerRootView>
    </SuperwallProvider>
  );
}

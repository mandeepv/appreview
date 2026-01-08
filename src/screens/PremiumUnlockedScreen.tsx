import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Button } from '../components/Button';

interface PremiumUnlockedScreenProps {
  navigation: any;
}

export default function PremiumUnlockedScreen({ navigation }: PremiumUnlockedScreenProps) {
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    // Trigger confetti animation on mount
    if (confettiRef.current) {
      confettiRef.current.start();
    }
  }, []);

  const handleStartLearning = () => {
    navigation.navigate('Root');
  };

  return (
    <View style={styles.container}>
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>Premium unlocked</Text>

        <Text style={styles.description}>
          This is your first step to be a better parent.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button onPress={handleStartLearning} title="START LEARNING" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E94B8F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkmark: {
    fontSize: 50,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E94B8F',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { ProgressBar } from '../../components/ProgressBar';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Loading'>;

export const LoadingScreen: React.FC<Props> = ({ navigation }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigation.replace('LessonPreview');
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [navigation]);

  const getMessage = () => {
    if (progress < 25) return 'Analyzing your family profile...';
    if (progress < 50) return 'Designing lessons for tantrums and connection...';
    if (progress < 75) return 'Balancing science with real-life parenting...';
    if (progress < 95) return 'Keeping it practical, not preachy...';
    return 'Almost ready!';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✨</Text>
        </View>

        <Text style={styles.title}>
          Designing your personal parenting journey
        </Text>

        <Text style={styles.description}>
          We're creating a customized program just for you...
        </Text>

        <ProgressBar current={progress} total={100} style={styles.progressBar} />

        <Text style={styles.status}>{getMessage()}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#FCE7F3',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 32,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
  },
  status: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
});

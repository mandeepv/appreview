import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Props = NativeStackScreenProps<LessonStackParamList, 'NamingEmotionsSub1Screen1'>;

export const NamingEmotionsSub1Screen1: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    navigation.navigate('NamingEmotionsSub1Screen2');
  };

  return (
    <LessonContainer
      progress="1/6"
      label="HAPPY SITUATION"
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headline}>
            Let's start with a happy moment
          </Text>

          <Text style={styles.body}>
            Think of a specific moment from your past where you felt genuinely good.
          </Text>

          <Text style={styles.body}>
            It doesn't need to be a big achievement — even a small moment is enough.
          </Text>
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          variant="gradient"
        />
      </View>
    </LessonContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing['2xl'],
  },
  content: {
    gap: Spacing.xl,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
});

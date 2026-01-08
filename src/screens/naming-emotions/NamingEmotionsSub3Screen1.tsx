import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<LessonStackParamList, 'NamingEmotionsSub3Screen1'>;

export const NamingEmotionsSub3Screen1: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    navigation.navigate('NamingEmotionsSub3Screen2');
  };

  return (
    <LessonContainer
      progress="1/6"
      label="MAD SITUATION"
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headline}>
            Now let's look at a "mad" moment
          </Text>

          <Text style={styles.body}>
            Anger is almost never the root emotion. It's often protecting something more vulnerable underneath — like fear, shame, or hurt.
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

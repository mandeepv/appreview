import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec2Screen3'>;

export const DissociationSec2Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec2Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            What if I just dissociate?
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              When you dissociate, the problem doesn't go away.
            </Text>

            <Text style={styles.bodyText}>
              It keeps nagging you in the background.
            </Text>

            <Text style={styles.subheading}>
              In that school example, you may start feeling:
            </Text>

            <View style={styles.feelingsCard}>
              <View style={styles.feelingItem}>
                <Text style={styles.feelingIcon}>😔</Text>
                <Text style={styles.feelingText}>
                  Like you're failing as a parent
                </Text>
              </View>

              <View style={styles.feelingItem}>
                <Text style={styles.feelingIcon}>😰</Text>
                <Text style={styles.feelingText}>
                  Like you should be doing more
                </Text>
              </View>

              <View style={styles.feelingItem}>
                <Text style={styles.feelingIcon}>😟</Text>
                <Text style={styles.feelingText}>
                  Like something is unresolved
                </Text>
              </View>
            </View>

            <Text style={styles.bodyText}>
              That emotional weight builds up — quietly.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.subheading}>
              People dissociate a lot:
            </Text>

            <View style={styles.whenList}>
              <View style={styles.whenItem}>
                <Text style={styles.whenBullet}>•</Text>
                <Text style={styles.whenText}>
                  When facts challenge their beliefs
                </Text>
              </View>

              <View style={styles.whenItem}>
                <Text style={styles.whenBullet}>•</Text>
                <Text style={styles.whenText}>
                  When truths feel uncomfortable
                </Text>
              </View>

              <View style={styles.whenItem}>
                <Text style={styles.whenBullet}>•</Text>
                <Text style={styles.whenText}>
                  When something feels unsolvable
                </Text>
              </View>
            </View>

            <View style={styles.closingBox}>
              <Text style={styles.closingText}>
                Once you start noticing it,{'\n'}
                you'll see it everywhere — in yourself and others.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Next"
            onPress={handleNext}
            variant="gradient"
          />
        </View>
      </View>
    </LessonContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  contentSection: {
    gap: 20,
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 8,
  },
  feelingsCard: {
    backgroundColor: '#FFF4E6',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  feelingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feelingIcon: {
    fontSize: 24,
  },
  feelingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  divider: {
    height: 2,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  whenList: {
    gap: 12,
    paddingHorizontal: 12,
  },
  whenItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  whenBullet: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    lineHeight: 26,
  },
  whenText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  closingBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    marginTop: 8,
  },
  closingText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});

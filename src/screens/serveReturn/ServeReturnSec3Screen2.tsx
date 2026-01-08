import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec3Screen2'>;

export const ServeReturnSec3Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('ServeReturnSec3Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={5}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            What Serve & Return Is Not
          </Text>

          <View style={styles.contentSection}>
            <View style={styles.notCard}>
              <Text style={styles.notTitle}>Serve and return is NOT:</Text>

              <View style={styles.notItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.notText}>Fixing the problem</Text>
              </View>

              <View style={styles.notItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.notText}>Giving advice</Text>
              </View>

              <View style={styles.notItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.notText}>Always agreeing</Text>
              </View>
            </View>

            <View style={styles.isCard}>
              <Text style={styles.isTitle}>It IS:</Text>

              <View style={styles.isItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.isText}>Acknowledging the bid for connection</Text>
              </View>

              <View style={styles.isItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.isText}>Being present</Text>
              </View>

              <View style={styles.isItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.isText}>Showing you heard and care</Text>
              </View>
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
    marginBottom: 32,
    lineHeight: 34,
  },
  contentSection: {
    gap: 24,
  },
  notCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  notTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  notItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#D97706',
    marginRight: 12,
    marginTop: 2,
  },
  notText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  isCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  isTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  isItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkmark: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
    marginRight: 12,
    marginTop: 2,
  },
  isText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});

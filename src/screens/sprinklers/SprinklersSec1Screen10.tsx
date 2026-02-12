import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec1Screen10'>;

export const SprinklersSec1Screen10: React.FC<Props> = ({ navigation }) => {
    const handleComplete = async () => {
        // Mark section as complete
        try {
            const STORAGE_KEY = '@sprinklers_completed_sections';
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            let completedSections = stored ? JSON.parse(stored) : [];
            if (!completedSections.includes('1')) {
                completedSections.push('1');
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedSections));
            }
        } catch (error) {
            if (__DEV__) console.error('Error saving progress:', error);
        }

        navigation.navigate('SprinklersLesson' as any);
    };

    return (
        <LessonContainer
            currentStep={10}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.completionCard}>
                        <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
                        <Text style={styles.completionTitle}>Sublesson complete</Text>
                        <Text style={styles.completionText}>
                            You’ve learned when deep bonds are actually built.
                        </Text>
                    </View>

                    <View style={styles.previewCard}>
                        <Text style={styles.previewLabel}>NEXT:</Text>
                        <Text style={styles.previewTitle}>
                            How to show up during emotional moments without making things worse.
                        </Text>
                    </View>

                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Continue"
                        onPress={handleComplete}
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
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 32,
        paddingHorizontal: 10,
    },
    completionCard: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: Colors.surface,
        borderRadius: 24,
        ...Shadows.md,
        gap: 16,
    },
    completionTitle: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    completionText: {
        fontSize: 16,
        textAlign: 'center',
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    previewCard: {
        backgroundColor: '#F5F5F5',
        padding: 24,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    previewLabel: {
        fontSize: 12,
        fontWeight: Typography.weights.bold,
        color: Colors.textTertiary,
        marginBottom: 8,
        letterSpacing: 1,
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
        lineHeight: 26,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

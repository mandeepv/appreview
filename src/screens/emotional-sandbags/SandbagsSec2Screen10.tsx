import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec2Screen10'>;

export const SandbagsSec2Screen10: React.FC<Props> = ({ navigation }) => {
    const handleComplete = async () => {
        // Record completion of Sublesson 2
        try {
            const STORAGE_KEY = '@sandbags_completed_sections';
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            let completedSections = stored ? JSON.parse(stored) : [];
            if (!completedSections.includes('2')) {
                completedSections.push('2');
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedSections));
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }

        // Return to the Emotional Sandbags hub
        navigation.navigate('EmotionalSandbagsLesson' as any);
    };

    const bullets = [
        'Everyone carries emotional sandbags',
        'We can’t empty them alone',
        'Helping someone process emotions builds deep bonds',
        'This responsibility goes both ways',
    ];

    return (
        <LessonContainer
            currentStep={10}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Ionicons name="checkmark-done-circle" size={60} color="#4CAF50" />
                        <Text style={styles.headline}>Today you learned</Text>
                    </View>

                    <View style={styles.bulletsContainer}>
                        {bullets.map((bullet, index) => (
                            <View key={index} style={styles.bulletItem}>
                                <Ionicons name="caret-forward" size={16} color={Colors.primary} />
                                <Text style={styles.bulletText}>{bullet}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.teaserCard}>
                        <Text style={styles.teaserLabel}>COMING UP NEXT</Text>
                        <Text style={styles.teaserText}>
                            Next, you’ll learn <Text style={styles.bold}>how to help someone empty their sandbags correctly</Text> — without fixing or making things worse.
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
        paddingBottom: 20,
    },
    content: {
        paddingTop: 20,
        paddingHorizontal: 24,
        gap: 32,
    },
    header: {
        alignItems: 'center',
        gap: 16,
    },
    headline: {
        fontSize: 28,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    bulletsContainer: {
        gap: 16,
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: BorderRadius.xl,
        ...Shadows.sm,
    },
    bulletItem: {
        flexDirection: 'row',
        gap: 12,
    },
    bulletText: {
        fontSize: 16,
        color: Colors.textPrimary,
        lineHeight: 24,
        flex: 1,
    },
    teaserCard: {
        backgroundColor: Colors.primaryBg,
        padding: 24,
        borderRadius: BorderRadius.xl,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    teaserLabel: {
        fontSize: 12,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        letterSpacing: 1.2,
    },
    teaserText: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    bold: {
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    buttonContainer: {
        width: '100%',
    },
});

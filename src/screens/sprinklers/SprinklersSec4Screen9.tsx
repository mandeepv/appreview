import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import type { LessonStackParamList, RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';

type Props = CompositeScreenProps<
  NativeStackScreenProps<LessonStackParamList, 'SprinklersSec4Screen9'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const SprinklersSec4Screen9: React.FC<Props> = ({ navigation }) => {
    const handleComplete = async () => {
        // Mark section as complete
        try {
            const STORAGE_KEY = STORAGE_KEYS.SPRINKLERS_COMPLETED_SECTIONS;
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            let completedSections = stored ? JSON.parse(stored) : [];
            if (!completedSections.includes('4')) {
                completedSections.push('4');
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedSections));
            }
        } catch (error) {
            if (__DEV__) console.error('Error saving progress:', error);
        }

        navigation.navigate('SprinklersLesson');
    };

    return (
        <LessonContainer
            currentStep={9}
            totalSteps={9}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.visualContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="star" size={50} color={Colors.primary} />
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.headline}>You’re learning something powerful</Text>

                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Today you learned:</Text>

                        <View style={styles.summaryList}>
                            {[
                                'You don’t need to be perfect',
                                'Feeling awkward is normal',
                                'Small moments build lifelong bonds'
                            ].map((text, index) => (
                                <View key={index} style={styles.summaryItem}>
                                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                                    <Text style={styles.summaryText}>{text}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            With a little practice, this is a skill you can learn—and it can change lives across generations.
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Finish lesson"
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
    visualContainer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.md,
    },
    content: {
        paddingHorizontal: 24,
        gap: 32,
    },
    headline: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 24,
        gap: 16,
        ...Shadows.md,
    },
    summaryLabel: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: Typography.weights.bold,
        textTransform: 'uppercase',
    },
    summaryList: {
        gap: 12,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    summaryText: {
        fontSize: 17,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
    },
    footer: {
        paddingHorizontal: 10,
    },
    footerText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

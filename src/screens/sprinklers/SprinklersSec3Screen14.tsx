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
  NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen14'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const SprinklersSec3Screen14: React.FC<Props> = ({ navigation }) => {
    const handleComplete = async () => {
        // Mark section as complete
        try {
            const STORAGE_KEY = STORAGE_KEYS.SPRINKLERS_COMPLETED_SECTIONS;
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            let completedSections = stored ? JSON.parse(stored) : [];
            if (!completedSections.includes('3')) {
                completedSections.push('3');
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedSections));
            }
        } catch (error) {
            if (__DEV__) console.error('Error saving progress:', error);
        }

        navigation.navigate('SprinklersLesson');
    };

    return (
        <LessonContainer
            currentStep={14}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.spacer} />

                <View style={styles.content}>
                    <Text style={styles.headline}>
                        When the sprinklers come on, your job is not to fix.
                    </Text>

                    <View style={styles.journeyCard}>
                        <Text style={styles.journeyLabel}>Your job is to help them move safely:</Text>

                        <View style={styles.steps}>
                            <View style={styles.step}>
                                <Text style={styles.stepText}>Primitive</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color={Colors.textTertiary} />
                            <View style={styles.step}>
                                <Text style={styles.stepText}>Cooling</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color={Colors.textTertiary} />
                            <View style={styles.step}>
                                <Text style={styles.stepText}>Logical</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Deep bonds are built by how we walk with them through that journey.
                        </Text>
                    </View>
                </View>

                <View style={styles.spacer} />

                <View style={styles.buttonContainer}>
                    <Button
                        title="Next sublesson"
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
    spacer: {
        flex: 1,
    },
    content: {
        gap: 32,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    headline: {
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 32,
    },
    journeyCard: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 24,
        gap: 20,
        width: '100%',
        ...Shadows.md,
    },
    journeyLabel: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontWeight: Typography.weights.semibold,
    },
    steps: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    step: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    stepText: {
        fontSize: 14,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    footer: {
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 17,
        color: Colors.textPrimary,
        fontWeight: Typography.weights.medium,
        textAlign: 'center',
        lineHeight: 26,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

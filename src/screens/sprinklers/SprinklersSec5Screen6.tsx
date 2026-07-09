import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  NativeStackScreenProps<LessonStackParamList, 'SprinklersSec5Screen6'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const SprinklersSec5Screen6: React.FC<Props> = ({ navigation }) => {
    const handleNext = async () => {
        try {
            const STORAGE_KEY = STORAGE_KEYS.SPRINKLERS_COMPLETED_SECTIONS;
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            let completedSections = stored ? JSON.parse(stored) : [];
            if (!completedSections.includes('5')) {
                completedSections.push('5');
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedSections));
            }
        } catch (error) {
            if (__DEV__) console.error('Error saving progress:', error);
        }
        navigation.navigate('SprinklersLesson');
    };

    const handleTakeBreak = () => {
        // SPEC-08 FLAG (runtime discrepancy, intentionally NOT "fixed"):
        // 'Learn' is a MainTab route nested under Root's 'MainTabs', so the
        // type-correct call is navigate('MainTabs', { screen: 'Learn' }). But
        // this screen has ALWAYS called navigate('Learn') at runtime, relying
        // on React Navigation resolving the nested route name by search. The
        // spec forbids changing runtime route names/params, so we keep the
        // existing call and localize the one unavoidable cast here rather than
        // rewrite the navigation. See the PR notes.
        navigation.navigate('Learn' as never);
    };

    return (
        <LessonContainer
            currentStep={6}
            totalSteps={6}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.visualContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="rocket-outline" size={60} color={Colors.primary} />
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.headline}>This is just the beginning</Text>

                    <Text style={styles.body}>
                        In the next lesson, we’ll learn how to apply this understanding directly in relationships—step by step.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Continue to next lesson →"
                        onPress={handleNext}
                        variant="gradient"
                        style={styles.mainButton}
                    />
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleTakeBreak}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.secondaryButtonText}>Take a break</Text>
                    </TouchableOpacity>
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
        paddingTop: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.md,
    },
    content: {
        paddingHorizontal: 24,
        gap: 20,
        alignItems: 'center',
    },
    headline: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    body: {
        fontSize: 18,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
        gap: 12,
    },
    mainButton: {
        marginBottom: 0,
    },
    secondaryButton: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: Typography.weights.bold,
        color: Colors.textTertiary,
    },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec1Screen3'>;

export const SandbagsSec1Screen3: React.FC<Props> = ({ navigation }) => {
    const handleNext = async () => {
        // Record completion of Sublesson 1
        try {
            const STORAGE_KEY = '@sandbags_completed_sections';
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            let completedSections = stored ? JSON.parse(stored) : [];
            if (!completedSections.includes('1')) {
                completedSections.push('1');
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedSections));
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }

        // In a real app, this might show a "Sublesson Complete" state
        // For now, we go back to the hub to see the progress update, 
        // or the user might expect forced flow. User's sublesson title says "Introduction",
        // and Screen 3 navigates to concept. Let's return to hub or proceed to Sec2Screen1?
        // User expectation for "LessonFlow" usually implies a continuous experience within sublessons.
        // However, hub progress usually updates when returning. 
        // I'll navigate to SandbagsSec2Screen1 but ensure progress is saved.
        navigation.navigate('SandbagsSec2Screen1');
    };

    return (
        <LessonContainer
            currentStep={3}
            totalSteps={3}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="bulb-outline" size={60} color={Colors.primary} />
                    </View>

                    <Text style={styles.headline}>
                        Let’s name what’s really happening
                    </Text>

                    <Text style={styles.body}>
                        To understand this responsibility, we need a simple metaphor — one that explains why emotions feel so heavy, and why we can’t always deal with them alone.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Show me"
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
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    content: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 24,
        alignItems: 'center',
        gap: 32,
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
    headline: {
        fontSize: 28,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 38,
    },
    body: {
        fontSize: 18,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 30,
    },
    buttonContainer: {
        width: '100%',
    },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec5Screen7'>;

export const SprinklersSec5Screen7: React.FC<Props> = ({ navigation }) => {
    const handleFinish = async () => {
        try {
            const STORAGE_KEY = '@sprinklers_completed_sections';
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            let completedSections = stored ? JSON.parse(stored) : [];
            if (!completedSections.includes('5')) {
                completedSections.push('5');
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedSections));
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }
        navigation.navigate('SprinklersLesson' as any);
    };

    const handleReview = () => {
        // In a real app, this would open the store link
        console.log('Opening Play Market...');
    };

    return (
        <LessonContainer
            currentStep={7}
            totalSteps={7}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.visualContainer}>
                    <View style={styles.emojiContainer}>
                        <View style={styles.floatingIcons}>
                            <Ionicons name="thumbs-up" size={24} color="#4285F4" style={styles.icon1} />
                            <Ionicons name="thumbs-up" size={24} color="#4285F4" style={styles.icon2} />
                            <Ionicons name="heart" size={24} color="#FF4081" style={styles.icon3} />
                            <Ionicons name="star" size={20} color="#FFC107" style={styles.icon4} />
                        </View>
                        <View style={styles.mainThumbsUp}>
                            <Ionicons name="thumbs-up" size={80} color="#FFC107" />
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}>We need your help</Text>
                    <Text style={styles.body}>
                        As you know, we don't charge for any products or services so the main way others learn about our content is by app reviews.{' '}
                        <Text style={styles.bold}>
                            Would you be willing to leave us a review in the Play Market so other parents and children can benefit?
                        </Text>
                    </Text>

                    <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={handleReview}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.reviewButtonText}>Review App</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Next"
                        onPress={handleFinish}
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
    visualContainer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    emojiContainer: {
        width: 200,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainThumbsUp: {
        backgroundColor: '#F5F5F5',
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    floatingIcons: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    icon1: { position: 'absolute', top: 10, left: 30 },
    icon2: { position: 'absolute', top: 10, right: 30 },
    icon3: { position: 'absolute', bottom: 40, left: 20 },
    icon4: { position: 'absolute', bottom: 50, right: 40 },
    card: {
        backgroundColor: Colors.surface,
        marginHorizontal: 20,
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        ...Shadows.md,
        gap: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: Typography.weights.bold,
        color: '#3F51B5', // Indigo-ish color from image
        textAlign: 'center',
    },
    body: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    bold: {
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    reviewButton: {
        backgroundColor: '#7986CB', // Lighter indigo
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        ...Shadows.sm,
    },
    reviewButtonText: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
        color: Colors.surface,
    },
    buttonContainer: {
        paddingHorizontal: 0,
    },
});

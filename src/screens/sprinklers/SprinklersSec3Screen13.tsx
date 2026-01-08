import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen13'>;

export const SprinklersSec3Screen13: React.FC<Props> = ({ navigation }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const options = [
        { id: 0, text: 'Immediately start with advice' },
        { id: 1, text: 'Organize feelings, give advice sparingly, and listen without getting defensive', isCorrect: true },
        { id: 2, text: 'Stay silent and avoid the topic' },
        { id: 3, text: 'Focus only on consequences' },
    ];

    const handleOptionPress = (index: number) => {
        if (showFeedback) return;
        setSelectedOption(index);
        setShowFeedback(true);
    };

    const handleNext = () => {
        navigation.navigate('SprinklersSec3Screen14');
    };

    return (
        <LessonContainer
            currentStep={13}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                    <Text style={styles.question}>
                        What should we do in phase 3, the logical brain phase?
                    </Text>

                    <View style={styles.optionsContainer}>
                        {options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            const isCorrect = option.isCorrect;

                            let backgroundColor: string = Colors.surface;
                            let borderColor: string = Colors.border;
                            let textColor: string = Colors.textPrimary;

                            if (showFeedback) {
                                if (option.isCorrect) {
                                    backgroundColor = '#E8F5E9';
                                    borderColor = '#4CAF50';
                                } else if (isSelected) {
                                    backgroundColor = '#FFEBEE';
                                    borderColor = '#EF5350';
                                }
                            }

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.option,
                                        { backgroundColor, borderColor }
                                    ]}
                                    onPress={() => handleOptionPress(index)}
                                    activeOpacity={0.7}
                                    disabled={showFeedback}
                                >
                                    <Text style={[styles.optionText, { color: textColor }]}>
                                        {option.text}
                                    </Text>
                                    {showFeedback && option.isCorrect && (
                                        <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                                    )}
                                    {showFeedback && isSelected && !option.isCorrect && (
                                        <Ionicons name="close-circle" size={24} color={Colors.error} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {showFeedback && (
                        <View style={styles.feedbackContainer}>
                            <View style={styles.feedbackHeader}>
                                <Ionicons
                                    name={options[selectedOption!]?.isCorrect ? "checkmark-circle" : "information-circle"}
                                    size={24}
                                    color={options[selectedOption!]?.isCorrect ? Colors.success : Colors.primary}
                                />
                                <Text style={styles.feedbackTitle}>
                                    {options[selectedOption!]?.isCorrect ? "Correct" : "Almost"}
                                </Text>
                            </View>
                            <Text style={styles.feedbackText}>
                                During phase 3 we can help organize feelings, give advice (sparingly), and listen without getting defensive.
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {showFeedback && (
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Next"
                            onPress={handleNext}
                            variant="gradient"
                        />
                    </View>
                )}
            </View>
        </LessonContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    scroll: {
        flex: 1,
        paddingTop: 10,
    },
    question: {
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        lineHeight: 32,
        marginBottom: 24,
    },
    optionsContainer: {
        gap: 12,
        marginBottom: 24,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 15,
        fontWeight: Typography.weights.medium,
        flex: 1,
        lineHeight: 20,
    },
    feedbackContainer: {
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.sm,
        marginBottom: 20,
    },
    feedbackHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    feedbackTitle: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    feedbackText: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

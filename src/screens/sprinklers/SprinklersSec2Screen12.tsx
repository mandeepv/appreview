import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen12'>;

export const SprinklersSec2Screen12: React.FC<Props> = ({ navigation }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const options = [
        { id: 0, text: 'Minimizing' },
        { id: 1, text: 'Siding with the enemy', isCorrect: true },
        { id: 2, text: 'Problem solving' },
        { id: 3, text: 'Trying to cheer up' },
    ];

    const handleOptionPress = (index: number) => {
        if (showFeedback) return;
        setSelectedOption(index);
        setShowFeedback(true);
    };

    const handleNext = () => {
        navigation.navigate('SprinklersSec2Screen13');
    };

    return (
        <LessonContainer
            currentStep={12}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.scenarioCard}>
                        <Text style={styles.scenarioText}>
                            Sarah is upset that her teacher kept her in from recess. Her mom says:
                        </Text>
                        <Text style={styles.quoteText}>
                            “Obviously the teacher had a good reason.”
                        </Text>
                    </View>

                    <Text style={styles.question}>
                        What mistake is Sarah’s mom making?
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
                                    {options[selectedOption!]?.isCorrect ? "Correct" : "Not quite"}
                                </Text>
                            </View>
                            <Text style={styles.feedbackText}>
                                When kids are upset, they need us on their team first — not explanations.
                            </Text>
                        </View>
                    )}
                </View>

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
    content: {
        flex: 1,
        paddingTop: 10,
        gap: 20,
    },
    scenarioCard: {
        backgroundColor: '#F5F5F5',
        padding: 20,
        borderRadius: 16,
        gap: 12,
    },
    scenarioText: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    quoteText: {
        fontSize: 17,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        fontStyle: 'italic',
    },
    question: {
        fontSize: 20,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    optionsContainer: {
        gap: 8,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 15,
        fontWeight: Typography.weights.medium,
        flex: 1,
    },
    feedbackContainer: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.sm,
    },
    feedbackHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    feedbackTitle: {
        fontSize: 16,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    feedbackText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

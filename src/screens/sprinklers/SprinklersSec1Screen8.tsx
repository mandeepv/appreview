import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec1Screen8'>;

export const SprinklersSec1Screen8: React.FC<Props> = ({ navigation }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const options = [
        { id: 0, text: 'Buying them something expensive' },
        { id: 1, text: 'Having shared experiences like vacations' },
        { id: 2, text: 'Learning how to help them during emotional or upset moments', isCorrect: true },
        { id: 3, text: 'Doing tasks for them so they can relax' },
        { id: 4, text: 'Telling them they are attractive' },
    ];

    const handleOptionPress = (index: number) => {
        if (showFeedback) return;
        setSelectedOption(index);
        setShowFeedback(true);
    };

    const handleNext = () => {
        navigation.navigate('SprinklersSec1Screen9');
    };

    return (
        <LessonContainer
            currentStep={8}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.question}>
                        The best way to bond with our romantic partner is…
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
                                The strongest bonds form when someone feels emotionally supported during difficult moments.
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
    question: {
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        lineHeight: 32,
    },
    optionsContainer: {
        gap: 10,
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
        marginRight: 8,
    },
    feedbackContainer: {
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.sm,
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
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

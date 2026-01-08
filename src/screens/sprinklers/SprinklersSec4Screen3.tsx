import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec4Screen3'>;

export const SprinklersSec4Screen3: React.FC<Props> = ({ navigation }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const options = [
        { id: 0, text: 'True' },
        { id: 1, text: 'False', isCorrect: true },
    ];

    const handleOptionPress = (index: number) => {
        if (showFeedback) return;
        setSelectedOption(index);
        setShowFeedback(true);
    };

    const handleNext = () => {
        navigation.navigate('SprinklersSec4Screen4');
    };

    return (
        <LessonContainer
            currentStep={3}
            totalSteps={9}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.question}>
                        True or False:{"\n"}To build deep bonds you need to do this correctly 80% of the time
                    </Text>

                    <View style={styles.optionsContainer}>
                        {options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            const isCorrect = option.isCorrect;

                            let backgroundColor: string = Colors.surface;
                            let borderColor: string = Colors.border;

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
                                    <Text style={styles.optionText}>
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
                                You don’t need to do this perfectly. Even small, imperfect efforts build trust over time.
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
        paddingTop: 40,
        gap: 32,
    },
    question: {
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        lineHeight: 32,
        textAlign: 'center',
    },
    optionsContainer: {
        gap: 16,
        paddingHorizontal: 20,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        ...Shadows.sm,
    },
    optionText: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    feedbackContainer: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: BorderRadius.lg,
        marginHorizontal: 20,
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

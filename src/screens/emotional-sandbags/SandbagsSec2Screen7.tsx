import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec2Screen7'>;

export const SandbagsSec2Screen7: React.FC<Props> = ({ navigation }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const options = [
        'Help them process their emotions',
        'Give them some alone time',
        'Help them put things in perspective',
        'All of the above',
    ];

    const correctIndex = 0;

    const handleOptionSelect = (index: number) => {
        if (isCorrect !== null) return;
        setSelectedOption(index);
        setIsCorrect(index === correctIndex);
    };

    const handleNext = () => {
        navigation.navigate('SandbagsSec2Screen8');
    };

    return (
        <LessonContainer
            currentStep={7}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.quizHeader}>
                        <Ionicons name="help-circle" size={32} color={Colors.primary} />
                        <Text style={styles.quizTitle}>Quick Quiz</Text>
                    </View>

                    <Text style={styles.question}>
                        When someone we love is upset, what is the #1 way to help them?
                    </Text>

                    <View style={styles.optionsContainer}>
                        {options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            const isOptionCorrect = index === correctIndex;

                            let backgroundColor: string = Colors.surface;
                            let borderColor: string = Colors.border;

                            if (isSelected) {
                                if (isOptionCorrect) {
                                    backgroundColor = '#E8F5E9';
                                    borderColor = '#4CAF50';
                                } else {
                                    backgroundColor = '#FFEBEE';
                                    borderColor = '#F44336';
                                }
                            } else if (isCorrect !== null && isOptionCorrect) {
                                backgroundColor = '#E8F5E9';
                                borderColor = '#4CAF50';
                            }

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.optionCard, { backgroundColor, borderColor }]}
                                    onPress={() => handleOptionSelect(index)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                    {isSelected && (
                                        <Ionicons
                                            name={isOptionCorrect ? "checkmark-circle" : "close-circle"}
                                            size={24}
                                            color={isOptionCorrect ? "#4CAF50" : "#F44336"}
                                        />
                                    )}
                                    {!isSelected && isCorrect !== null && isOptionCorrect && (
                                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {isCorrect !== null && (
                        <View style={[styles.feedbackBox, isCorrect ? styles.correctFeedback : styles.incorrectFeedback]}>
                            <Text style={styles.feedbackText}>
                                {isCorrect
                                    ? "Helping someone process emotions is the fastest way to create relief and connection."
                                    : "Not quite. While other things can help sometimes, processing emotions is the most powerful tool for connection."}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Next Question"
                        onPress={handleNext}
                        variant="gradient"
                        disabled={isCorrect === null}
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
        paddingTop: 10,
        paddingHorizontal: 24,
        gap: 20,
    },
    quizHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    quizTitle: {
        fontSize: 16,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    question: {
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 30,
        marginBottom: 10,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
        ...Shadows.xs,
    },
    optionText: {
        fontSize: 16,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
        flex: 1,
    },
    feedbackBox: {
        padding: 20,
        borderRadius: BorderRadius.lg,
        marginTop: 10,
    },
    correctFeedback: {
        backgroundColor: '#E8F5E9',
    },
    incorrectFeedback: {
        backgroundColor: '#FFEBEE',
    },
    feedbackText: {
        fontSize: 15,
        color: Colors.textPrimary,
        lineHeight: 22,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
    },
});

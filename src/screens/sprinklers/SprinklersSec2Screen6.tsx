import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen6'>;

export const SprinklersSec2Screen6: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec2Screen7');
    };

    return (
        <LessonContainer
            currentStep={6}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.headerSection}>
                    <Text style={styles.headline}>
                        Mistake #1: Problem solving too soon
                    </Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.body}>
                        Let’s go back to the park.
                    </Text>

                    <View style={styles.scenarioBox}>
                        <Text style={styles.scenarioText}>
                            You’re walking with a friend.
                            The sprinklers suddenly turn on.
                        </Text>
                        <Text style={styles.scenarioText}>
                            Your friend grabs your arm and says:
                        </Text>
                        <View style={styles.quoteBox}>
                            <Text style={styles.quoteText}>
                                “We should’ve noticed the sprinklers earlier.”
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.body}>
                        It might be good advice — but now is not the time.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Next →"
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
    },
    headerSection: {
        paddingTop: 10,
    },
    headline: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 34,
    },
    content: {
        gap: 20,
        flex: 1,
        justifyContent: 'center',
    },
    body: {
        fontSize: 18,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
    },
    scenarioBox: {
        backgroundColor: '#F5F5F5',
        padding: 24,
        borderRadius: 20,
        gap: 16,
        ...Shadows.sm,
    },
    scenarioText: {
        fontSize: 16,
        color: Colors.textPrimary,
        lineHeight: 24,
        textAlign: 'center',
    },
    quoteBox: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    quoteText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: Colors.primary,
        fontWeight: Typography.weights.bold,
        textAlign: 'center',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

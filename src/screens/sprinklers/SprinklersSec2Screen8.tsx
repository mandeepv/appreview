import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen8'>;

export const SprinklersSec2Screen8: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec2Screen9');
    };

    return (
        <LessonContainer
            currentStep={8}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.headerSection}>
                    <Text style={styles.headline}>
                        Mistake #2: Minimizing
                    </Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.body}>
                        Back in the park.
                    </Text>

                    <View style={styles.scenarioBox}>
                        <Text style={styles.scenarioText}>
                            The sprinklers turn on and your friend says:
                        </Text>
                        <View style={styles.quoteBox}>
                            <Text style={styles.quoteText}>
                                “It’s not a big deal.”
                            </Text>
                        </View>
                    </View>

                    <View style={styles.insightBox}>
                        <Text style={styles.insightText}>
                            Maybe it isn’t to them.
                        </Text>
                        <Text style={[styles.insightText, styles.bold]}>
                            But it is to you.
                        </Text>
                    </View>
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
        gap: 32,
        flex: 1,
        justifyContent: 'center',
    },
    body: {
        fontSize: 18,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
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
        borderLeftColor: '#E53935',
    },
    quoteText: {
        fontSize: 18,
        fontStyle: 'italic',
        color: '#E53935',
        fontWeight: Typography.weights.bold,
        textAlign: 'center',
    },
    insightBox: {
        gap: 8,
    },
    insightText: {
        fontSize: 18,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    bold: {
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec5Screen5'>;

export const SprinklersSec5Screen5: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec5Screen6');
    };

    return (
        <LessonContainer
            currentStep={5}
            totalSteps={7}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headline}>Notice it in the people you love</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.body}>Begin noticing this in others too.</Text>

                    <View style={styles.questionsContainer}>
                        {[
                            'How long does it take them to cool down?',
                            'How long does it take you?',
                            'Is it minutes? Hours? Longer?'
                        ].map((question, index) => (
                            <View key={index} style={styles.questionItem}>
                                <Ionicons name="help-circle" size={24} color={Colors.primary} />
                                <Text style={styles.questionText}>{question}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.microBox}>
                        <Text style={styles.microText}>There’s no “right” answer.</Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Next"
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
    header: {
        paddingTop: 40,
        paddingHorizontal: 24,
    },
    headline: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 32,
    },
    body: {
        fontSize: 20,
        color: Colors.textPrimary,
        fontWeight: Typography.weights.medium,
        textAlign: 'center',
    },
    questionsContainer: {
        gap: 16,
    },
    questionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: BorderRadius.lg,
        gap: 16,
        ...Shadows.sm,
    },
    questionText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: Typography.weights.medium,
        flex: 1,
    },
    microBox: {
        alignItems: 'center',
    },
    microText: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

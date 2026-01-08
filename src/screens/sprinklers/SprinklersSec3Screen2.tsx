import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen2'>;

export const SprinklersSec3Screen2: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec3Screen3');
    };

    const phases = [
        { number: 1, title: 'Primitive Brain Phase', color: '#FFEBEE', icon: 'flash' },
        { number: 2, title: 'Cooling Down Period', color: '#E3F2FF', icon: 'thermometer-outline' },
        { number: 3, title: 'Logical Brain Phase', color: '#E8F5E9', icon: 'bulb-outline' },
    ];

    return (
        <LessonContainer
            currentStep={2}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.headline}>The emotional sprinkler has three phases:</Text>

                    <View style={styles.phasesContainer}>
                        {phases.map((phase) => (
                            <View key={phase.number} style={[styles.phaseCard, { backgroundColor: phase.color }]}>
                                <View style={styles.phaseHeader}>
                                    <View style={styles.numberCircle}>
                                        <Text style={styles.numberText}>{phase.number}</Text>
                                    </View>
                                    <Ionicons name={phase.icon as any} size={24} color={Colors.textPrimary} />
                                </View>
                                <Text style={styles.phaseTitle}>{phase.title}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.footerText}>
                        Each phase needs a different response.
                    </Text>
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
    content: {
        paddingTop: 20,
        gap: 32,
    },
    headline: {
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    phasesContainer: {
        gap: 16,
    },
    phaseCard: {
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        ...Shadows.sm,
    },
    phaseHeader: {
        alignItems: 'center',
        gap: 8,
    },
    numberCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberText: {
        fontSize: 14,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    phaseTitle: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    footerText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

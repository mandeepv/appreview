import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen7'>;

export const SprinklersSec3Screen7: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec3Screen8');
    };

    return (
        <LessonContainer
            currentStep={7}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="thermometer-outline" size={32} color={Colors.primary} />
                    </View>
                    <Text style={styles.headline}>Phase 2: The Cooling Down Period</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.subheadline}>This phase can last:</Text>

                    <View style={styles.timeOptions}>
                        {['2 minutes', '2 hours', 'Or even 2 days'].map((time, index) => (
                            <View key={index} style={styles.timeBadge}>
                                <Text style={styles.timeText}>{time}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.insightBox}>
                        <Text style={styles.insightText}>
                            The primitive brain needs time to deactivate on its own.
                        </Text>
                        <View style={styles.emphasis}>
                            <Ionicons name="timer-outline" size={24} color={Colors.primary} />
                            <Text style={styles.emphasisText}>You can’t rush this phase.</Text>
                        </View>
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
        alignItems: 'center',
        paddingTop: 20,
        gap: 12,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E3F2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headline: {
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 32,
    },
    subheadline: {
        fontSize: 18,
        fontWeight: Typography.weights.semibold,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    timeOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    timeBadge: {
        backgroundColor: Colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.sm,
    },
    timeText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: Typography.weights.bold,
    },
    insightBox: {
        gap: 20,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    insightText: {
        fontSize: 18,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 26,
    },
    emphasis: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#E3F2FF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emphasisText: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

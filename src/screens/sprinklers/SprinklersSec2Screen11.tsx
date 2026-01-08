import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen11'>;

export const SprinklersSec2Screen11: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec2Screen12');
    };

    return (
        <LessonContainer
            currentStep={11}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.spacer} />

                <View style={styles.content}>
                    <Text style={styles.headline}>
                        Why this hurts connection
                    </Text>

                    <Text style={styles.body}>
                        When a child is upset and we say:
                    </Text>

                    <View style={styles.quoteBox}>
                        <Text style={styles.quoteText}>
                            “Maybe you did something to deserve it.”
                        </Text>
                    </View>

                    <Text style={styles.body}>
                        They don’t feel understood. They feel alone.
                    </Text>

                    <View style={styles.teamBox}>
                        <Text style={styles.teamText}>
                            When someone’s primitive brain is activated, they need to know:
                        </Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>You’re on their team.</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.spacer} />

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
    spacer: {
        flex: 1,
    },
    content: {
        gap: 24,
        alignItems: 'center',
    },
    headline: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    body: {
        fontSize: 17,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    quoteBox: {
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 12,
        width: '100%',
    },
    quoteText: {
        fontSize: 16,
        color: '#D32F2F',
        fontWeight: Typography.weights.bold,
        textAlign: 'center',
    },
    teamBox: {
        alignItems: 'center',
        gap: 16,
        marginTop: 10,
    },
    teamText: {
        fontSize: 16,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    badge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#4CAF50',
        ...Shadows.sm,
    },
    badgeText: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
        color: '#2E7D32',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

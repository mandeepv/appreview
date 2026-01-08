import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec5Screen2'>;

export const SprinklersSec5Screen2: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec5Screen3');
    };

    return (
        <LessonContainer
            currentStep={2}
            totalSteps={7}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headline}>When emotions run high, the primitive brain takes over</Text>
                </View>

                <View style={styles.visualContainer}>
                    <View style={styles.diagram}>
                        <View style={styles.step}>
                            <Ionicons name="flash" size={24} color="#E53935" />
                            <Text style={styles.stepLabel}>Sprinkler</Text>
                            <Text style={styles.stepSub}>Primitive</Text>
                        </View>
                        <View style={styles.arrow}>
                            <Ionicons name="arrow-forward" size={20} color={Colors.textTertiary} />
                        </View>
                        <View style={styles.step}>
                            <Ionicons name="thermometer-outline" size={24} color={Colors.primary} />
                            <Text style={styles.stepLabel}>Cooling</Text>
                            <Text style={styles.stepSub}>Period</Text>
                        </View>
                        <View style={styles.arrow}>
                            <Ionicons name="arrow-forward" size={20} color={Colors.textTertiary} />
                        </View>
                        <View style={styles.step}>
                            <Ionicons name="bulb-outline" size={24} color="#2E7D32" />
                            <Text style={styles.stepLabel}>Logic</Text>
                            <Text style={styles.stepSub}>Active</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.body}>
                        We learned that our loved ones can get caught in the sprinkler of emotions, where the primitive brain takes control.
                    </Text>
                    <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                            In this phase, it’s not helpful to give advice or problem-solve.
                        </Text>
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
        paddingTop: 10,
        paddingHorizontal: 20,
    },
    headline: {
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 30,
    },
    visualContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    diagram: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 20,
        ...Shadows.md,
        gap: 12,
    },
    step: {
        alignItems: 'center',
        gap: 4,
    },
    stepLabel: {
        fontSize: 14,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    stepSub: {
        fontSize: 12,
        color: Colors.textTertiary,
    },
    arrow: {
        paddingTop: 0,
    },
    content: {
        paddingHorizontal: 24,
        gap: 20,
    },
    body: {
        fontSize: 17,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 26,
    },
    warningBox: {
        backgroundColor: '#FFEBEE',
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#E53935',
    },
    warningText: {
        fontSize: 16,
        color: '#D32F2F',
        fontWeight: Typography.weights.semibold,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

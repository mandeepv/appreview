import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec5Screen4'>;

export const SprinklersSec5Screen4: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec5Screen5');
    };

    return (
        <LessonContainer
            currentStep={4}
            totalSteps={7}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headline}>Now notice this in your own life</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.body}>
                        Start noticing when your own primitive brain is in control.
                    </Text>

                    <View style={styles.pathCard}>
                        <Text style={styles.pathLabel}>Notice when you move from:</Text>
                        <View style={styles.pathItems}>
                            <View style={styles.pathItem}>
                                <Ionicons name="flash" size={20} color="#E53935" />
                                <Text style={styles.pathText}>Primitive</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={16} color={Colors.textTertiary} />
                            <View style={styles.pathItem}>
                                <Ionicons name="thermometer-outline" size={20} color={Colors.primary} />
                                <Text style={styles.pathText}>Cooling Off</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={16} color={Colors.textTertiary} />
                            <View style={styles.pathItem}>
                                <Ionicons name="bulb-outline" size={20} color="#2E7D32" />
                                <Text style={styles.pathText}>Logical</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.reflectionBox}>
                        <Ionicons name="eye-outline" size={24} color={Colors.textSecondary} />
                        <Text style={styles.reflectionText}>Just notice. No fixing.</Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Continue"
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
        fontSize: 18,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 28,
    },
    pathCard: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 24,
        ...Shadows.md,
        gap: 16,
    },
    pathLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: Typography.weights.bold,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    pathItems: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    pathItem: {
        alignItems: 'center',
        gap: 4,
        width: 80,
    },
    pathText: {
        fontSize: 12,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    reflectionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    reflectionText: {
        fontSize: 18,
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

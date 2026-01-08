import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen11'>;

export const SprinklersSec3Screen11: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec3Screen12');
    };

    return (
        <LessonContainer
            currentStep={11}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headline}>In Phase 3:</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.checklistCard}>
                        {[
                            'Listen without getting defensive',
                            'Ask for their side of the story',
                            'Validate how it felt for them',
                            'Help them label and organize emotions'
                        ].map((item, index) => (
                            <View key={index} style={styles.checkItem}>
                                <Ionicons name="checkmark-done" size={24} color={Colors.primary} />
                                <Text style={styles.checkText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.insightBox}>
                        <Text style={styles.insightText}>
                            What felt like a jumbled mess can finally start making sense.
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
        gap: 32,
    },
    checklistCard: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 24,
        gap: 20,
        ...Shadows.md,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: Typography.weights.medium,
        lineHeight: 22,
        flex: 1,
    },
    insightBox: {
        paddingHorizontal: 20,
    },
    insightText: {
        fontSize: 17,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
        fontStyle: 'italic',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

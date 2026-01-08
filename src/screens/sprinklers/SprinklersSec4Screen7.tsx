import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec4Screen7'>;

export const SprinklersSec4Screen7: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec4Screen8');
    };

    return (
        <LessonContainer
            currentStep={7}
            totalSteps={9}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.visualContainer}>
                    <View style={styles.illustration}>
                        <Ionicons name="sparkles" size={64} color="#FBC02D" />
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.headline}>Small moments matter</Text>

                    <Text style={styles.body}>
                        You may be tempted—especially with younger kids—to feel like their problems are too small.
                    </Text>

                    <View style={styles.insightCard}>
                        <Ionicons name="ticket" size={24} color={Colors.primary} />
                        <Text style={styles.insightText}>
                            Being there in the <Text style={styles.highlight}>broken toy</Text> moments earns you a ticket to the <Text style={styles.highlight}>broken heart</Text> moments later in life.
                        </Text>
                    </View>

                    <Text style={styles.footerText}>
                        If a child doesn’t feel safe coming to you with the small things now, they won’t come to you later with the big things.
                    </Text>
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
    visualContainer: {
        alignItems: 'center',
        paddingTop: 10,
    },
    illustration: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFFDE7',
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    content: {
        paddingHorizontal: 24,
        gap: 20,
    },
    headline: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    body: {
        fontSize: 17,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 26,
    },
    insightCard: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        ...Shadows.md,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    insightText: {
        fontSize: 16,
        color: Colors.textPrimary,
        lineHeight: 24,
        flex: 1,
    },
    highlight: {
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    footerText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 24,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

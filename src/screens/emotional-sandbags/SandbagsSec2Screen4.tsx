import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec2Screen4'>;

export const SandbagsSec2Screen4: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SandbagsSec2Screen5');
    };

    return (
        <LessonContainer
            currentStep={4}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.headline}>We can’t empty them on our own</Text>

                    <View style={styles.card}>
                        <Text style={styles.body}>
                            As hard as we try, it’s incredibly difficult to empty these sandbags by ourselves.
                        </Text>

                        <View style={styles.bulletList}>
                            <View style={styles.bulletItem}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
                                <Text style={styles.bulletText}>They’re hard to reach.</Text>
                            </View>
                            <View style={styles.bulletItem}>
                                <Ionicons name="barbell-outline" size={20} color={Colors.primary} />
                                <Text style={styles.bulletText}>They’re emotionally heavy.</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.insightBox}>
                        <Ionicons name="people-outline" size={32} color={Colors.primary} />
                        <Text style={styles.insightText}>
                            The most effective way they get emptied is when <Text style={styles.bold}>someone else helps us process</Text> what we’re feeling.
                        </Text>
                    </View>

                    <View style={styles.clarification}>
                        <Text style={styles.clarificationText}>
                            This doesn’t mean fixing the problem. It means helping the emotions <Text style={styles.italic}>move through</Text>.
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="What happens when they’re emptied?"
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
        paddingBottom: 20,
    },
    content: {
        paddingTop: 20,
        paddingHorizontal: 24,
        gap: 24,
    },
    headline: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 34,
    },
    card: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: BorderRadius.xl,
        ...Shadows.sm,
        gap: 16,
    },
    body: {
        fontSize: 18,
        color: Colors.textSecondary,
        lineHeight: 28,
    },
    bulletList: {
        gap: 12,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bulletText: {
        fontSize: 16,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    insightBox: {
        backgroundColor: Colors.primaryBg,
        padding: 24,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        gap: 16,
    },
    insightText: {
        fontSize: 18,
        color: Colors.textPrimary,
        lineHeight: 28,
        textAlign: 'center',
    },
    bold: {
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    clarification: {
        paddingHorizontal: 12,
    },
    clarificationText: {
        fontSize: 15,
        color: Colors.textTertiary,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 22,
    },
    italic: {
        fontWeight: Typography.weights.bold,
    },
    buttonContainer: {
        width: '100%',
    },
});

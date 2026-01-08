import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec2Screen1'>;

export const SandbagsSec2Screen1: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SandbagsSec2Screen2');
    };

    return (
        <LessonContainer
            currentStep={1}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.headline}>Imagine this moment</Text>

                    <View style={styles.storyCard}>
                        <Text style={styles.storyText}>
                            Your partner comes home and closes the door harder than usual. A few minutes later, they walk into the room looking stressed and frustrated.
                        </Text>

                        <View style={styles.divider} />

                        <View style={styles.detailsList}>
                            <View style={styles.detailItem}>
                                <Ionicons name="car-outline" size={20} color={Colors.primary} />
                                <Text style={styles.detailText}>They had a flat tire.</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                                <Text style={styles.detailText}>AAA took twice as long as promised.</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
                                <Text style={styles.detailText}>They missed an important meeting.</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.questionContainer}>
                        <Text style={styles.emphasisText}>They’re clearly upset.</Text>
                        <Text style={styles.questionText}>What do you do?</Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Keep going"
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
        paddingHorizontal: 20,
        gap: 24,
    },
    headline: {
        fontSize: 28,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    storyCard: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: BorderRadius.xl,
        ...Shadows.md,
        gap: 16,
    },
    storyText: {
        fontSize: 18,
        color: Colors.textPrimary,
        lineHeight: 28,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
    },
    detailsList: {
        gap: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailText: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: Typography.weights.medium,
    },
    questionContainer: {
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
    emphasisText: {
        fontSize: 20,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    questionText: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    buttonContainer: {
        width: '100%',
    },
});

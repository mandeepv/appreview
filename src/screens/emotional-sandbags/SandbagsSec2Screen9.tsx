import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec2Screen9'>;

export const SandbagsSec2Screen9: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SandbagsSec2Screen10');
    };

    const donts = [
        { text: 'Don’t fix', icon: 'construct-outline' },
        { text: 'Don’t minimize', icon: 'trending-down-outline' },
        { text: 'Don’t cheer up', icon: 'happy-outline' },
    ];

    return (
        <LessonContainer
            currentStep={9}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.headline}>Try this today</Text>

                    <Text style={styles.body}>
                        The next time someone in your life seems frustrated or overwhelmed:
                    </Text>

                    <View style={styles.dontList}>
                        {donts.map((item, index) => (
                            <View key={index} style={styles.dontItem}>
                                <Ionicons name={item.icon as any} size={24} color="#F44336" />
                                <Text style={styles.dontText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.actionCard}>
                        <Ionicons name="chatbubble-ellipses" size={40} color={Colors.primary} />
                        <Text style={styles.actionText}>
                            Just help them <Text style={styles.bold}>talk it out</Text>.
                        </Text>
                        <Text style={styles.subActionText}>
                            Even a few minutes can empty a lot of sand.
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Finish Lesson"
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
        fontSize: 28,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    body: {
        fontSize: 18,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
    },
    dontList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    dontItem: {
        alignItems: 'center',
        gap: 8,
        width: '30%',
    },
    dontText: {
        fontSize: 14,
        fontWeight: Typography.weights.bold,
        color: Colors.textTertiary,
        textAlign: 'center',
    },
    actionCard: {
        backgroundColor: Colors.primaryBg,
        padding: 32,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        gap: 16,
        ...Shadows.sm,
    },
    actionText: {
        fontSize: 22,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    subActionText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    bold: {
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    buttonContainer: {
        width: '100%',
    },
});

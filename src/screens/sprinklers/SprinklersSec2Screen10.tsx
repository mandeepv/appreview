import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen10'>;

export const SprinklersSec2Screen10: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec2Screen11');
    };

    return (
        <LessonContainer
            currentStep={10}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.headerSection}>
                    <Text style={styles.headline}>
                        Mistake #3: Not being on their team
                    </Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.body}>
                        Imagine the sprinklers turn on and your friend says:
                    </Text>

                    <View style={styles.quoteBox}>
                        <Text style={styles.quoteText}>
                            “Well, the sprinklers had to run or the grass would die.”
                        </Text>
                    </View>

                    <View style={styles.insightBox}>
                        <Text style={styles.insightText}>
                            That probably wouldn’t feel very supportive.
                        </Text>
                    </View>
                </View>

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
    headerSection: {
        paddingTop: 10,
    },
    headline: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    content: {
        gap: 32,
        flex: 1,
        justifyContent: 'center',
    },
    body: {
        fontSize: 18,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    quoteBox: {
        backgroundColor: '#F5F5F5',
        padding: 24,
        borderRadius: 20,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
        ...Shadows.sm,
    },
    quoteText: {
        fontSize: 18,
        fontStyle: 'italic',
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 28,
    },
    insightBox: {
        paddingHorizontal: 20,
    },
    insightText: {
        fontSize: 17,
        color: Colors.textTertiary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

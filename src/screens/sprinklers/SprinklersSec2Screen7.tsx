import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen7'>;

export const SprinklersSec2Screen7: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec2Screen8');
    };

    return (
        <LessonContainer
            currentStep={7}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.spacer} />

                <View style={styles.content}>
                    <Text style={styles.headline}>
                        How this shows up with kids
                    </Text>

                    <Text style={styles.body}>
                        When kids are upset, we often jump to advice:
                    </Text>

                    <View style={styles.examplesContainer}>
                        <View style={styles.exampleCard}>
                            <Text style={styles.exampleText}>“Put your toys away next time.”</Text>
                        </View>
                        <View style={styles.exampleCard}>
                            <Text style={styles.exampleText}>“You should’ve studied more.”</Text>
                        </View>
                    </View>

                    <Text style={styles.body}>
                        Even good advice can feel hurtful when their primitive brain is in control.
                    </Text>

                    <View style={styles.keyInsight}>
                        <Text style={styles.keyText}>
                            Your goal is not to solve — it’s to <Text style={styles.highlight}>emotionally connect</Text>.
                        </Text>
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
        gap: 20,
        alignItems: 'center',
    },
    headline: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        lineHeight: 34,
        textAlign: 'center',
    },
    body: {
        fontSize: 17,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        lineHeight: 26,
        textAlign: 'center',
    },
    examplesContainer: {
        width: '100%',
        gap: 12,
    },
    exampleCard: {
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    exampleText: {
        fontSize: 16,
        color: Colors.textPrimary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    keyInsight: {
        backgroundColor: '#E3F2FF',
        padding: 20,
        borderRadius: 16,
        marginTop: 10,
        ...Shadows.sm,
    },
    keyText: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        textAlign: 'center',
        lineHeight: 26,
    },
    highlight: {
        textDecorationLine: 'underline',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

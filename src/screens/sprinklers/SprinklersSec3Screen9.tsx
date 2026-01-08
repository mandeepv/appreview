import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen9'>;

export const SprinklersSec3Screen9: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec3Screen10');
    };

    return (
        <LessonContainer
            currentStep={9}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.spacer} />

                <View style={styles.content}>
                    <View style={styles.quoteBox}>
                        <Text style={styles.quoteText}>
                            “If the emotional (or primitive) mind starts taking over again, just go back to listening and sympathizing.”
                        </Text>
                        <Text style={styles.author}>— Dr. Stephen Covey</Text>
                    </View>

                    <View style={styles.lessonBox}>
                        <Text style={styles.lessonText}>
                            The brain’s recovery isn’t always a straight line. If they get upset again, simply step back into Phase 1 support.
                        </Text>
                    </View>
                </View>

                <View style={styles.spacer} />

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
    spacer: {
        flex: 1,
    },
    content: {
        gap: 40,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    quoteBox: {
        backgroundColor: Colors.surface,
        padding: 32,
        borderRadius: 24,
        gap: 16,
        ...Shadows.md,
        borderLeftWidth: 6,
        borderLeftColor: Colors.primary,
    },
    quoteText: {
        fontSize: 20,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
        lineHeight: 30,
        fontStyle: 'italic',
    },
    author: {
        fontSize: 16,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        textAlign: 'right',
    },
    lessonBox: {
        paddingHorizontal: 20,
    },
    lessonText: {
        fontSize: 17,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

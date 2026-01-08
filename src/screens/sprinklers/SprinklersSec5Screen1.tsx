import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec5Screen1'>;

export const SprinklersSec5Screen1: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec5Screen2');
    };

    return (
        <LessonContainer
            currentStep={1}
            totalSteps={7}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.stepText}>Section 5 of 5</Text>
                    <Text style={styles.title}>Summary</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.body}>
                        Let’s quickly bring together what we learned in this lesson.
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
    header: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 8,
    },
    stepText: {
        fontSize: 14,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    title: {
        fontSize: 32,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    content: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    body: {
        fontSize: 22,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
        lineHeight: 32,
        textAlign: 'center',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

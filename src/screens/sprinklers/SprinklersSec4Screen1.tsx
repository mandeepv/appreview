import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec4Screen1'>;

export const SprinklersSec4Screen1: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec4Screen2');
    };

    return (
        <LessonContainer
            currentStep={1}
            totalSteps={9}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.stepText}>Section 4 of 5</Text>
                    <Text style={styles.title}>Three Things to Remember</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.body}>
                        This might sound hard or overwhelming at first.
                    </Text>

                    <Text style={styles.body}>
                        Before we move on, there are three important things we want you to remember.
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
        paddingTop: 40,
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
        fontSize: 28,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    content: {
        paddingHorizontal: 20,
        gap: 24,
    },
    body: {
        fontSize: 20,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
        lineHeight: 30,
        textAlign: 'center',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

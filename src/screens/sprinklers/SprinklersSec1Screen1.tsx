import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec1Screen1'>;

export const SprinklersSec1Screen1: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec1Screen2');
    };

    return (
        <LessonContainer
            currentStep={1}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.spacer} />

                <View style={styles.content}>
                    <Text style={styles.headline}>
                        How Do We Really Bond With Our Kids?
                    </Text>

                    <Text style={styles.body}>
                        Most parents think bonding happens during fun moments.
                    </Text>

                    <Text style={styles.body}>
                        Science says something very different.
                    </Text>

                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>⏱️ ~3–4 minutes</Text>
                    </View>
                </View>

                <View style={styles.spacer} />

                <View style={styles.buttonContainer}>
                    <Button
                        title="Start"
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
        fontSize: 28,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        lineHeight: 38,
        letterSpacing: -0.6,
        textAlign: 'center',
    },
    body: {
        fontSize: 18,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        lineHeight: 28,
        textAlign: 'center',
    },
    timeContainer: {
        marginTop: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    timeText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: Typography.weights.medium,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

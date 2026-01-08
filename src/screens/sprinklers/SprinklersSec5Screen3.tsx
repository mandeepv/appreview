import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec5Screen3'>;

export const SprinklersSec5Screen3: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec5Screen4');
    };

    return (
        <LessonContainer
            currentStep={3}
            totalSteps={7}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="timer-outline" size={48} color={Colors.primary} />
                    <Text style={styles.headline}>Advice works only at the right time</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.body}>
                        We also learned that giving advice too early doesn’t help.
                    </Text>

                    <Text style={styles.body}>
                        It’s best to wait until the cooling off period has passed and the logical brain is active again.
                    </Text>

                    <View style={styles.callout}>
                        <Text style={styles.calloutText}>Timing matters more than advice</Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Got it"
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
        paddingTop: 30,
        paddingHorizontal: 24,
        gap: 16,
    },
    headline: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 32,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 32,
    },
    body: {
        fontSize: 18,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 28,
    },
    callout: {
        backgroundColor: '#E3F2FF',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.sm,
    },
    calloutText: {
        fontSize: 20,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        textAlign: 'center',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec1Screen1'>;

export const SandbagsSec1Screen1: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SandbagsSec1Screen2');
    };

    return (
        <LessonContainer
            currentStep={1}
            totalSteps={3}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.headline}>
                        There’s something your loved ones want from you more than anything else
                    </Text>

                    <View style={styles.bodyContainer}>
                        <Text style={styles.body}>
                            Studies show there’s a relationship responsibility that most of us have never been taught — yet it’s the number one thing people crave from their partners, parents, and closest relationships.
                        </Text>

                        <Text style={styles.body}>
                            Most people don’t even realize it exists.
                        </Text>
                    </View>
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
        paddingBottom: 20,
    },
    content: {
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 20,
        gap: 32,
    },
    headline: {
        fontSize: 28,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        lineHeight: 38,
        textAlign: 'center',
    },
    bodyContainer: {
        gap: 24,
    },
    body: {
        fontSize: 18,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        lineHeight: 28,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
    },
});

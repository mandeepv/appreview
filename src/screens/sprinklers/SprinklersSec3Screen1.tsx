import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen1'>;

export const SprinklersSec3Screen1: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec3Screen2');
    };

    return (
        <LessonContainer
            currentStep={1}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.spacer} />

                <View style={styles.content}>
                    <Text style={styles.body}>
                        When someone is upset, it’s not random chaos.
                    </Text>

                    <Text style={styles.body}>
                        There are three predictable phases their brain moves through.
                    </Text>

                    <View style={styles.insightBox}>
                        <Text style={styles.insightText}>
                            Knowing the phase tells you what to do — and what not to do.
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
        gap: 32,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    body: {
        fontSize: 20,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
        lineHeight: 30,
        textAlign: 'center',
    },
    insightBox: {
        backgroundColor: '#E3F2FF',
        padding: 24,
        borderRadius: 20,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    insightText: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        textAlign: 'center',
        lineHeight: 26,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

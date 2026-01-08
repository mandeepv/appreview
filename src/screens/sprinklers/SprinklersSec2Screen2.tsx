import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen2'>;

export const SprinklersSec2Screen2: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec2Screen3');
    };

    return (
        <LessonContainer
            currentStep={2}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.illustrationContainer}>
                    <Text style={styles.illustrationEmoji}>⛲🚿🚿🚿👩‍👦</Text>
                    <View style={styles.grass} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.body}>
                        Imagine your child is walking through the park on a chilly day.
                        Suddenly, the sprinklers turn on and soak them.
                    </Text>

                    <Text style={styles.body}>
                        They’re surprised. Uncomfortable.
                        All they want is to get out of the situation.
                    </Text>
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
    illustrationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E3F2FF',
        borderRadius: 24,
        marginVertical: 20,
        overflow: 'hidden',
    },
    illustrationEmoji: {
        fontSize: 60,
        zIndex: 1,
    },
    grass: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 40,
        backgroundColor: '#81C784',
    },
    content: {
        gap: 20,
        paddingBottom: 40,
    },
    body: {
        fontSize: 18,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        lineHeight: 28,
        textAlign: 'center',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

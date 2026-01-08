import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen1'>;

export const SprinklersSec2Screen1: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec2Screen2');
    };

    return (
        <LessonContainer
            currentStep={1}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.spacer} />

                <View style={styles.content}>
                    <Text style={styles.label}>SECTION 2 OF 5</Text>
                    <Text style={styles.headline}>
                        What NOT to do when loved ones are upset
                    </Text>

                    <Text style={styles.body}>
                        Now that we know deep bonds are built during emotional moments,
                        let’s look at a simple analogy that shows why good intentions often backfire.
                    </Text>
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
    label: {
        fontSize: 12,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
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
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

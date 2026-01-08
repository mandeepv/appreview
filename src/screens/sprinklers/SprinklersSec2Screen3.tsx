import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen3'>;

export const SprinklersSec2Screen3: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec2Screen4');
    };

    return (
        <LessonContainer
            currentStep={3}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.spacer} />

                <View style={styles.content}>
                    <Text style={styles.headline}>
                        This is what emotional upset feels like
                    </Text>

                    <Text style={styles.body}>
                        When our kids are emotionally upset,
                        their experience is very similar.
                    </Text>

                    <View style={styles.emphasisBox}>
                        <Text style={styles.emphasisText}>
                            Their system is flooded.
                        </Text>
                        <Text style={styles.emphasisText}>
                            They want relief — not explanations.
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
        gap: 24,
        alignItems: 'center',
    },
    headline: {
        fontSize: 28,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        lineHeight: 38,
        textAlign: 'center',
    },
    body: {
        fontSize: 18,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        lineHeight: 28,
        textAlign: 'center',
    },
    emphasisBox: {
        backgroundColor: '#FFE4ED',
        padding: 24,
        borderRadius: 16,
        width: '100%',
        gap: 12,
    },
    emphasisText: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
        color: '#C2185B',
        textAlign: 'center',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

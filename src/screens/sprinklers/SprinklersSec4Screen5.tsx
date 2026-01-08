import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec4Screen5'>;

export const SprinklersSec4Screen5: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec4Screen6');
    };

    const milestones = [
        { year: '30 Years Ago', text: 'Dads saying “I love you” felt awkward.' },
        { year: '20 Years Ago', text: 'Wearing seatbelts felt awkward.' },
    ];

    return (
        <LessonContainer
            currentStep={5}
            totalSteps={9}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headline}>At first, new things feel uncomfortable.</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.timeline}>
                        {milestones.map((milestone, index) => (
                            <View key={index} style={styles.milestone}>
                                <View style={styles.markerContainer}>
                                    <View style={styles.circle} />
                                    {index < milestones.length && <View style={styles.line} />}
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.year}>{milestone.year}</Text>
                                    <Text style={styles.text}>{milestone.text}</Text>
                                </View>
                            </View>
                        ))}

                        <View style={styles.milestone}>
                            <View style={styles.markerContainer}>
                                <View style={[styles.circle, { backgroundColor: Colors.primary }]} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.year, { color: Colors.primary }]}>Today</Text>
                                <Text style={[styles.text, { fontWeight: Typography.weights.bold }]}>
                                    Over time, they become normal—and second nature.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="That makes sense"
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
        paddingTop: 20,
        paddingHorizontal: 24,
    },
    headline: {
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 30,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    timeline: {
        gap: 0,
    },
    milestone: {
        flexDirection: 'row',
        gap: 20,
        minHeight: 80,
    },
    markerContainer: {
        alignItems: 'center',
        width: 20,
    },
    circle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.border,
        zIndex: 1,
    },
    line: {
        flex: 1,
        width: 2,
        backgroundColor: Colors.border,
        marginVertical: -8,
    },
    textContainer: {
        flex: 1,
        paddingBottom: 24,
    },
    year: {
        fontSize: 14,
        fontWeight: Typography.weights.bold,
        color: Colors.textTertiary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    text: {
        fontSize: 17,
        color: Colors.textPrimary,
        lineHeight: 24,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen4'>;

export const SprinklersSec3Screen4: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec3Screen5');
    };

    return (
        <LessonContainer
            currentStep={4}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headline}>In Phase 1, do NOT:</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.card}>
                        {[
                            'Give advice or problem solve',
                            'Teach lessons or consequences',
                            'Try to cheer them up',
                            'Minimize what they’re feeling'
                        ].map((item, index) => (
                            <View key={index} style={styles.item}>
                                <Ionicons name="close-circle" size={24} color="#D32F2F" />
                                <Text style={styles.itemText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.insightBox}>
                        <Text style={styles.insightText}>
                            The logical brain isn’t available yet.
                        </Text>
                    </View>
                </View>

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
    header: {
        paddingTop: 20,
    },
    headline: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 40,
    },
    card: {
        backgroundColor: '#FFEBEE',
        padding: 24,
        borderRadius: 24,
        gap: 20,
        ...Shadows.md,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemText: {
        fontSize: 17,
        color: '#B71C1C',
        fontWeight: Typography.weights.semibold,
    },
    insightBox: {
        paddingHorizontal: 20,
    },
    insightText: {
        fontSize: 18,
        color: Colors.textTertiary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

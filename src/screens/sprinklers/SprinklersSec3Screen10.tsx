import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen10'>;

export const SprinklersSec3Screen10: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec3Screen11');
    };

    return (
        <LessonContainer
            currentStep={10}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="bulb-outline" size={32} color="#2E7D32" />
                    </View>
                    <Text style={styles.headline}>Phase 3: The Logical Brain Phase</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.subheadline}>This phase happens when:</Text>

                    <View style={styles.conditionsContainer}>
                        {[
                            'Emotions have cooled',
                            'The brain can think again'
                        ].map((text, index) => (
                            <View key={index} style={styles.conditionCard}>
                                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                <Text style={styles.conditionText}>{text}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.highlightBox}>
                        <Text style={styles.highlightText}>
                            This is where learning can finally happen.
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
        alignItems: 'center',
        paddingTop: 20,
        gap: 12,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headline: {
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 32,
    },
    subheadline: {
        fontSize: 18,
        fontWeight: Typography.weights.semibold,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    conditionsContainer: {
        gap: 16,
    },
    conditionCard: {
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        ...Shadows.sm,
    },
    conditionText: {
        fontSize: 17,
        color: Colors.textPrimary,
        fontWeight: Typography.weights.bold,
    },
    highlightBox: {
        backgroundColor: '#E8F5E9',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    highlightText: {
        fontSize: 18,
        color: '#2E7D32',
        fontWeight: Typography.weights.bold,
        textAlign: 'center',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

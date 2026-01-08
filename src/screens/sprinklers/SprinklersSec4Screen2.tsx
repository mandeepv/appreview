import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec4Screen2'>;

export const SprinklersSec4Screen2: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec4Screen3');
    };

    return (
        <LessonContainer
            currentStep={2}
            totalSteps={9}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.visualContainer}>
                    <View style={styles.illustration}>
                        <Ionicons name="people" size={80} color={Colors.primary} />
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.headline}>You don’t need to do this perfectly</Text>

                    <Text style={styles.body}>
                        Dr. John Gottman states that parents who are really great at building deep bonds are only doing it right about 30% of the time.
                    </Text>

                    <Text style={styles.body}>
                        You don’t have to be perfect at this to make a big difference.
                    </Text>

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>30% is enough</Text>
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
    visualContainer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    illustration: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    content: {
        paddingHorizontal: 20,
        gap: 20,
        alignItems: 'center',
    },
    headline: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    body: {
        fontSize: 18,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 28,
    },
    badge: {
        backgroundColor: '#E3F2FF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 10,
    },
    badgeText: {
        fontSize: 16,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

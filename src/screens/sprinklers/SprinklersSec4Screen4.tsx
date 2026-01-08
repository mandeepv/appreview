import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec4Screen4'>;

export const SprinklersSec4Screen4: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec4Screen5');
    };

    return (
        <LessonContainer
            currentStep={4}
            totalSteps={9}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.visualContainer}>
                    <View style={styles.illustration}>
                        <Ionicons name="happy-outline" size={80} color="#FF9800" />
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.headline}>This may feel awkward at first</Text>

                    <Text style={styles.body}>
                        You may feel like this is cheesy or uncomfortable.
                    </Text>

                    <Text style={styles.body}>
                        Could you really talk to your kids about their feelings?
                    </Text>

                    <View style={styles.insightBox}>
                        <Text style={styles.insightText}>
                            Just know: everything related to deep bonds feels awkward at first.
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
    visualContainer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    illustration: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    content: {
        paddingHorizontal: 24,
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
    insightBox: {
        backgroundColor: '#F5F5F5',
        padding: 20,
        borderRadius: 16,
        marginTop: 10,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    insightText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 22,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

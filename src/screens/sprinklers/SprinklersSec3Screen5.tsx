import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen5'>;

export const SprinklersSec3Screen5: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec3Screen6');
    };

    return (
        <LessonContainer
            currentStep={5}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headline}>So what should you do?</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.recognitionCard}>
                        <Text style={styles.recognitionLabel}>First, recognize the moment:</Text>
                        <Text style={styles.recognitionQuote}>“They are in the emotional sprinkler.”</Text>
                    </View>

                    <View style={styles.actionsCard}>
                        <Text style={styles.actionsLabel}>Then:</Text>
                        <View style={styles.actionItem}>
                            <Ionicons name="heart" size={24} color={Colors.primary} />
                            <Text style={styles.actionText}>Show sympathy</Text>
                        </View>
                        <View style={styles.actionItem}>
                            <Ionicons name="people" size={24} color={Colors.primary} />
                            <Text style={styles.actionText}>Be nearby</Text>
                        </View>
                        <View style={styles.actionItem}>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                            <Text style={styles.actionText}>Let them know they’re not alone</Text>
                        </View>
                    </View>

                    <View style={styles.footerBox}>
                        <Text style={styles.footerText}>This is not fixing.</Text>
                        <Text style={styles.footerHighight}>This is building safety.</Text>
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
        paddingTop: 10,
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
        gap: 24,
    },
    recognitionCard: {
        backgroundColor: '#F5F5F5',
        padding: 20,
        borderRadius: 16,
        gap: 8,
    },
    recognitionLabel: {
        fontSize: 14,
        color: Colors.textTertiary,
        fontWeight: Typography.weights.bold,
        textTransform: 'uppercase',
    },
    recognitionQuote: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        fontStyle: 'italic',
    },
    actionsCard: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 24,
        gap: 16,
        ...Shadows.md,
    },
    actionsLabel: {
        fontSize: 16,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionText: {
        fontSize: 17,
        color: Colors.textPrimary,
        fontWeight: Typography.weights.medium,
    },
    footerBox: {
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    footerHighight: {
        fontSize: 20,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

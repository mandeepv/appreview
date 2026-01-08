import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen4'>;

export const SprinklersSec2Screen4: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec2Screen5');
    };

    return (
        <LessonContainer
            currentStep={4}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <Text style={styles.headline}>
                    What’s happening in their brain?
                </Text>

                <View style={styles.diagramContainer}>
                    <View style={[styles.zone, styles.logicalZone]}>
                        <Text style={styles.zoneLabel}>Logical (OFF)</Text>
                    </View>
                    <View style={[styles.zone, styles.emotionalZone]}>
                        <Text style={styles.zoneLabel}>Emotional</Text>
                    </View>
                    <View style={[styles.zone, styles.primitiveZone]}>
                        <Text style={styles.zoneLabel}>Primitive (IN CONTROL)</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.body}>
                        When a child is upset, the <Text style={styles.bold}>primitive brain</Text> takes control.
                    </Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>This part of the brain is great at:</Text>
                        <View style={styles.actionRow}>
                            <View style={styles.actionBadge}><Text style={styles.actionText}>Fighting</Text></View>
                            <View style={styles.actionBadge}><Text style={styles.actionText}>Running</Text></View>
                        </View>
                        <Text style={styles.infoFooter}>But it’s not good at thinking things through.</Text>
                    </View>
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
    headline: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginTop: 10,
    },
    diagramContainer: {
        height: 200,
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 40,
    },
    zone: {
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    logicalZone: {
        backgroundColor: '#E0E0E0',
        opacity: 0.6,
    },
    emotionalZone: {
        backgroundColor: '#FFE4ED',
    },
    primitiveZone: {
        backgroundColor: '#FFEBEE',
        borderWidth: 2,
        borderColor: '#EF5350',
    },
    zoneLabel: {
        fontSize: 14,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    content: {
        gap: 20,
        paddingBottom: 20,
    },
    body: {
        fontSize: 17,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        lineHeight: 26,
        textAlign: 'center',
    },
    bold: {
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    infoBox: {
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: 16,
        gap: 12,
        ...Shadows.sm,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: Typography.weights.semibold,
        color: Colors.textTertiary,
        textAlign: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    actionBadge: {
        backgroundColor: '#EF5350',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    actionText: {
        color: '#FFFFFF',
        fontWeight: Typography.weights.bold,
        fontSize: 14,
    },
    infoFooter: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 4,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

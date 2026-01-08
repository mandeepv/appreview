import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec2Screen3'>;

export const SandbagsSec2Screen3: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SandbagsSec2Screen4');
    };

    const emotions = [
        { text: 'Frustration when plans fall apart', icon: 'trending-down' },
        { text: 'Stress from work', icon: 'briefcase' },
        { text: 'Anger from small conflicts', icon: 'thunderstorm' },
        { text: 'Overwhelm from responsibilities', icon: 'layers' },
    ];

    return (
        <LessonContainer
            currentStep={3}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.headline}>We’re all carrying emotional sandbags</Text>

                    <View style={styles.visualContainer}>
                        <View style={styles.sandbagVisual}>
                            <Text style={styles.emoji}>🎒</Text>
                            <View style={styles.labelsContainer}>
                                <View style={styles.label}><Text style={styles.labelText}>STRESS</Text></View>
                                <View style={styles.label}><Text style={styles.labelText}>ANGER</Text></View>
                                <View style={styles.label}><Text style={styles.labelText}>OVERWHELM</Text></View>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.body}>
                        Each of us carries heavy sandbags filled with emotions. They fill up throughout the day:
                    </Text>

                    <View style={styles.list}>
                        {emotions.map((item, index) => (
                            <View key={index} style={styles.listItem}>
                                <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                                <Text style={styles.listText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.footerNote}>
                        By the end of the day, those bags can be very heavy.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Why this matters"
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
        paddingBottom: 20,
    },
    content: {
        paddingTop: 10,
        paddingHorizontal: 24,
        gap: 20,
    },
    headline: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 32,
    },
    visualContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    sandbagVisual: {
        width: 140,
        height: 140,
        backgroundColor: '#F0F0F0',
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    emoji: {
        fontSize: 60,
    },
    labelsContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        position: 'absolute',
        backgroundColor: Colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.sm,
    },
    labelText: {
        fontSize: 10,
        fontWeight: Typography.weights.bold,
        color: Colors.textSecondary,
    },
    // Positioning labels around the bag
    label1: { top: 10, left: 10 },
    label2: { bottom: 10, right: 10 },
    label3: { top: 30, right: -10 },
    body: {
        fontSize: 17,
        color: Colors.textPrimary,
        lineHeight: 26,
        textAlign: 'center',
    },
    list: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 12,
        borderRadius: BorderRadius.md,
        gap: 12,
        ...Shadows.xs,
    },
    listText: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontWeight: Typography.weights.medium,
    },
    footerNote: {
        fontSize: 16,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginTop: 5,
    },
    buttonContainer: {
        width: '100%',
    },
});
// Re-adjusting labels in the code snippet for clarity

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec1Screen2'>;

export const SandbagsSec1Screen2: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SandbagsSec1Screen3');
    };

    const applications = [
        { icon: 'happy-outline', text: 'Your child is overwhelmed' },
        { icon: 'heart-outline', text: 'Your partner has had a rough day' },
        { icon: 'alert-circle-outline', text: 'You’re stressed, anxious, or emotionally full' },
    ];

    return (
        <LessonContainer
            currentStep={2}
            totalSteps={3}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.headline}>
                        And it affects almost every relationship in your life
                    </Text>

                    <Text style={styles.subheadline}>This applies when:</Text>

                    <View style={styles.listContainer}>
                        {applications.map((item, index) => (
                            <View key={index} style={styles.listItem}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
                                </View>
                                <Text style={styles.listText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryText}>
                            When this responsibility is met, relationships feel <Text style={styles.bold}>lighter and safer</Text>.
                        </Text>
                        <Text style={styles.summaryText}>
                            When it’s missed, <Text style={styles.bold}>frustration quietly builds</Text>.
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="So what is it?"
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
        paddingTop: 20,
        paddingHorizontal: 20,
        gap: 20,
    },
    headline: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: 10,
    },
    subheadline: {
        fontSize: 16,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    listContainer: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
        gap: 16,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listText: {
        fontSize: 16,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
        flex: 1,
    },
    summaryBox: {
        marginTop: 10,
        padding: 20,
        backgroundColor: '#F5F9FF',
        borderRadius: BorderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
        gap: 12,
    },
    summaryText: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    bold: {
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    buttonContainer: {
        width: '100%',
    },
});

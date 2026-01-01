import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'LessonPreview'>;

export const LessonPreviewScreen: React.FC<Props> = ({ navigation }) => {
    const handleStartLesson = () => {
        navigation.navigate('Paywall');
    };

    return (
        <OnboardingContainer
            currentStep={18} // Approx step
            onBack={() => navigation.goBack()}
            centerTitle={true}
            title=""
        >
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Header Section */}
                    <Text style={styles.dayText}>Day 1 · Foundations</Text>
                    <Text style={styles.headline}>What Changed in How We Understand Parenting</Text>
                    <Text style={styles.helperText}>A short, research-based lesson (≈3 minutes)</Text>

                    {/* What you'll explore section */}
                    <View style={styles.exploreSection}>
                        <Text style={styles.sectionTitle}>In this lesson, you’ll explore:</Text>
                        <View style={styles.bulletList}>
                            <Text style={styles.bulletPoint}>• Why many traditional parenting approaches had limited success</Text>
                            <Text style={styles.bulletPoint}>• What modern brain research revealed about stress and bonding</Text>
                            <Text style={styles.bulletPoint}>• How this new understanding reshaped what actually helps children and families</Text>
                        </View>
                    </View>

                    {/* How lessons work section */}
                    <View style={styles.howItWorksSection}>
                        <Text style={styles.sectionTitle}>How lessons work</Text>
                        <View style={styles.bulletList}>
                            <Text style={styles.bulletPoint}>• Short, tap-through screens</Text>
                            <Text style={styles.bulletPoint}>• One idea at a time</Text>
                            <Text style={styles.bulletPoint}>• No long reading. No guilt.</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Button
                        title="Start Lesson →"
                        onPress={handleStartLesson}
                        style={styles.button}
                    />
                    <Text style={styles.microReassurance}>Free · Research-based · No judgment</Text>
                </View>
            </View>
        </OnboardingContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EC4899', // Pink
        marginBottom: 8,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    headline: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
    },
    helperText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        fontStyle: 'italic',
    },
    exploreSection: {
        marginBottom: 32,
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    bulletList: {
        gap: 12,
    },
    bulletPoint: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
    },
    howItWorksSection: {
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    footer: {
        paddingTop: 16,
    },
    button: {
        marginBottom: 12,
    },
    microReassurance: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
});

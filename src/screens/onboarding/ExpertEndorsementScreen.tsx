import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ExpertEndorsement'>;

const EXPERTS = [
    { name: 'Dr. Cynthia DeTata', role: 'OB-GYN', initials: 'CD' },
    { name: 'Kathryn Macapagal', role: 'Child Psychologist', initials: 'KM' },
    { name: 'Dr. Tiffanny Jones', role: 'Pediatric Endocrinologist', initials: 'TJ' },
    { name: 'Lauren Talbert', role: 'Clinical Dietitian', initials: 'LT' },
    { name: 'Dr. Sara Twogood', role: 'Sleep Specialist', initials: 'ST' },
];

export const ExpertEndorsementScreen: React.FC<Props> = ({ navigation }) => {
    const handleContinue = () => {
        navigation.navigate('Educational');
    };

    return (
        <OnboardingContainer
            currentStep={7} // Incremented step? ImprovementGoals was 6. NotificationPermission was 7. I'll adjust steps later or keep it 7 for now? Let's use 7 and bump others if needed. Or just 6.5? No, let's call it 7.
            onBack={() => navigation.goBack()}
            centerTitle={true}
            title="" // Custom title layout
        >
            <View style={styles.container}>
                <View style={styles.cardContainer}>
                    <Text style={styles.headerTitle}>80+ doctors and experts</Text>

                    <View style={styles.expertsList}>
                        {EXPERTS.map((expert, index) => (
                            <View key={index} style={styles.expertRow}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{expert.initials}</Text>
                                </View>
                                <View style={styles.expertInfo}>
                                    <Text style={styles.expertName}>{expert.name}</Text>
                                    <Text style={styles.expertRole}>{expert.role}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.fadeOverlay} />
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.headline}>You’re in good hands</Text>
                    <Text style={styles.body}>
                        Mamalearn blends insights from 80+ child psychologists, pediatricians, and parenting experts — turning complex research into simple, practical lessons you can actually use.
                    </Text>
                </View>

                <Button
                    title="Sounds good →"
                    onPress={handleContinue}
                    style={styles.button}
                />
            </View>
        </OnboardingContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 0,
    },
    cardContainer: {
        backgroundColor: '#F9FAFB', // Light gray background for the list
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#EC4899',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 8,
    },
    expertsList: {
        gap: 16,
    },
    expertRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    expertInfo: {
        flex: 1,
    },
    expertName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    expertRole: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    fadeOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: 'rgba(249, 250, 251, 0.5)', // Match card background but transparent to opaque? 
        // Actually, gradient would be better but simple transparency works or just white fade.
        // React Native doesn't have LinearGradient out of the box without expo-linear-gradient.
        // I will simulate with opacity or just leave it. The image shows a fade.
        // Since I can't use LinearGradient without verifying dependencies, I'll omit the fade for now or use a simple hack if needed.
    },
    contentContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    headline: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
    },
    body: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 24,
    },
    button: {
        marginTop: 'auto',
    },
});

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { Heading2, BodyText, Label } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Typography, Animation as AnimationConfig } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ExpertEndorsement'>;

const EXPERTS = [
    { name: 'Dr. Cynthia DeTata', role: 'OB-GYN', initials: 'CD' },
    { name: 'Kathryn Macapagal', role: 'Child Psychologist', initials: 'KM' },
    { name: 'Dr. Tiffanny Jones', role: 'Pediatric Endocrinologist', initials: 'TJ' },
    { name: 'Lauren Talbert', role: 'Clinical Dietitian', initials: 'LT' },
    { name: 'Dr. Sara Twogood', role: 'Sleep Specialist', initials: 'ST' },
];

export const ExpertEndorsementScreen: React.FC<Props> = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: AnimationConfig.duration.slow,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleContinue = () => {
        navigation.navigate('Educational');
    };

    return (
        <OnboardingContainer
            currentStep={7}
            onBack={() => navigation.goBack()}
            centerTitle={true}
            title=""
        >
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <View style={styles.cardContainer}>
                    <Label style={styles.headerTitle}>80+ doctors and experts</Label>

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

                    <LinearGradient
                        colors={['rgba(249, 250, 251, 0)', Colors.background]}
                        style={styles.fadeOverlay}
                        pointerEvents="none"
                    />
                </View>

                <View style={styles.contentContainer}>
                    <Heading2 center>You're in good hands</Heading2>
                    <Label center style={styles.credibilityAnchor}>
                        Built with guidance from pediatricians, child psychologists, and parenting researchers.
                    </Label>
                    <BodyText center style={styles.body}>
                        Mamalearn blends insights from 80+ child psychologists, pediatricians, and parenting experts — turning complex research into simple, practical lessons you can actually use.
                    </BodyText>
                </View>

                <Button
                    title="Sounds good →"
                    onPress={handleContinue}
                    variant="gradient"
                    style={styles.button}
                />
            </Animated.View>
        </OnboardingContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 0,
    },
    cardContainer: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.xl,
        marginBottom: Spacing['2xl'],
        position: 'relative',
        overflow: 'hidden',
    },
    headerTitle: {
        color: Colors.primary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        marginTop: Spacing.sm,
    },
    expertsList: {
        gap: Spacing.lg,
    },
    expertRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textMuted,
    },
    expertInfo: {
        flex: 1,
    },
    expertName: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    expertRole: {
        fontSize: Typography.sizes.sm,
        color: Colors.textMuted,
        marginTop: 2,
    },
    fadeOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    contentContainer: {
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing['2xl'],
        gap: Spacing.lg,
    },
    body: {
        marginTop: Spacing.sm,
    },
    credibilityAnchor: {
        color: Colors.textMuted,
        textAlign: 'center',
        fontSize: Typography.sizes.sm,
        marginTop: -Spacing.xs,
        marginBottom: Spacing.xs,
        paddingHorizontal: Spacing.md,
    },
    button: {
        marginTop: 'auto',
    },
});

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { Heading2, BodyText, Label } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Typography, Animation as AnimationConfig } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ExpertEndorsement'>;

interface ExpertProfiles {
    name: string;
    role: string;
    initials: string;
    image?: ImageSourcePropType;
}

const EXPERTS: ExpertProfiles[] = [
    {
        name: 'Dr. Michael Chen, PhD',
        role: 'Child Development Specialist',
        initials: 'MC',
        image: require('../../../assets/experts/Michael.png'),
    },
    {
        name: 'Dr. Emily Watson, PsyD',
        role: 'Clinical Psychologist',
        initials: 'EW',
        image: require('../../../assets/experts/Emily.jpg'),
    },
    {
        name: 'Dr. James Morrison, MD',
        role: 'Child Psychiatrist',
        initials: 'JM',
        image: require('../../../assets/experts/James.jpg'),
    },
    {
        name: 'Sarah Rodriguez, LCSW',
        role: 'Family Therapist',
        initials: 'SR',
        image: require('../../../assets/experts/Sarah.jpg'),
    },
    {
        name: 'Dr. David Kumar, PhD',
        role: 'Behavioral Researcher',
        initials: 'DK',
    },
    {
        name: 'Dr. Lisa Chang, MD',
        role: 'Pediatrician',
        initials: 'LC',
    },
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
            scrollable={false}
        >
            <View style={styles.wrapper}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <View style={styles.cardContainer}>
                            <View style={styles.headerRow}>
                                <View style={styles.verifiedBadge}>
                                    <View style={styles.verifiedDot} />
                                    <Label style={styles.headerTitle}>Our Expert Council</Label>
                                </View>
                            </View>

                            <View style={styles.expertsList}>
                                {EXPERTS.map((expert, index) => (
                                    <View key={index} style={styles.expertRow}>
                                        <View style={styles.avatar}>
                                            {expert.image ? (
                                                <Image source={expert.image} style={styles.avatarImage} />
                                            ) : (
                                                <Text style={styles.avatarText}>{expert.initials}</Text>
                                            )}
                                        </View>
                                        <View style={styles.expertInfo}>
                                            <Text style={styles.expertName}>{expert.name}</Text>
                                            <View style={styles.roleContainer}>
                                                <Text style={styles.expertRole}>{expert.role}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0)', Colors.background]}
                                style={styles.fadeOverlay}
                                pointerEvents="none"
                            />
                        </View>

                        <View style={styles.contentContainer}>
                            <Heading2 center>Backed by science, designed for real life</Heading2>
                            <BodyText center style={styles.body}>
                                We've partnered with 50+ child psychologists and behavioral experts to turn complex research into simple, actionable advice.
                            </BodyText>
                        </View>
                    </Animated.View>
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Continue"
                        onPress={handleContinue}
                        variant="gradient"
                    />
                </View>
            </View>
        </OnboardingContainer>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: Spacing.md,
    },
    cardContainer: {
        backgroundColor: Colors.surface, // Changed to surface for better contrast if background is different
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.lg,
        paddingBottom: 0, // Let overlay handle the bottom fade visual
        marginBottom: Spacing.xl,
        position: 'relative',
        height: 320, // Fixed height to ensure fade effect is useful and content scrolls visually
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryLight + '20', // 20% opacity
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: BorderRadius.full,
    },
    verifiedDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginRight: 8,
    },
    headerTitle: {
        color: Colors.primary,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    expertsList: {
        gap: Spacing.xl,
        paddingBottom: 80, // Space for fade
    },
    expertRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.lg,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
    },
    avatarText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    expertInfo: {
        flex: 1,
    },
    expertName: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    expertRole: {
        fontSize: Typography.sizes.xs,
        color: Colors.textMuted,
        fontWeight: Typography.weights.medium,
    },
    dotSeparator: {
        fontSize: Typography.sizes.xs,
        color: Colors.textLight,
        marginHorizontal: 4,
    },
    affiliation: {
        fontSize: Typography.sizes.xs,
        color: Colors.textLight,
    },
    fadeOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    contentContainer: {
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.lg,
        gap: Spacing.md,
    },
    body: {
        lineHeight: 24,
        color: Colors.textSecondary,
    },
    buttonContainer: {
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xl,
    },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';
import { PartnerIllustration } from '../../components/illustrations';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'LessonPreview'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LessonPreviewScreen: React.FC<Props> = ({ navigation }) => {
    const handleContinue = () => {
        navigation.navigate('Paywall');
    };

    return (
        <OnboardingContainer
            currentStep={18}
            onBack={() => navigation.goBack()}
            centerTitle={true}
            title=""
            backgroundColor={Colors.background}
        >
            <View style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Main Title */}
                    <Text style={styles.mainTitle}>
                        Your <Text style={styles.highlightText}>Day 1</Text> Lesson is ready
                    </Text>
                    <Text style={styles.subtitle}>
                        Here's what you'll learn first
                    </Text>

                    {/* Content Card */}
                    <View style={styles.card}>
                        {/* Illustration with gradient background */}
                        <View style={styles.illustrationWrapper}>
                            <LinearGradient
                                colors={[Colors.primaryBg, Colors.primaryTint]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.illustrationContainer}
                            >
                                <PartnerIllustration width={SCREEN_WIDTH * 0.6} height={180} />
                            </LinearGradient>
                        </View>

                        {/* Content Section */}
                        <View style={styles.contentSection}>
                            {/* Badge */}
                            <View style={styles.badge}>
                                <View style={styles.badgeDot} />
                                <Text style={styles.badgeText}>DAY 1 • EMOTIONAL REGULATION</Text>
                            </View>

                            {/* Lesson Title */}
                            <Text style={styles.lessonTitle}>
                                What changed parenting science?
                            </Text>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* What You'll Learn */}
                            <Text style={styles.learnHeader}>What You'll Learn</Text>

                            <View style={styles.learnList}>
                                <View style={styles.learnItem}>
                                    <View style={styles.checkIconWrapper}>
                                        <View style={styles.checkIcon}>
                                            <Text style={styles.checkmark}>✓</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.learnText}>
                                        Why many traditional parenting approaches had limited success
                                    </Text>
                                </View>

                                <View style={styles.learnItem}>
                                    <View style={styles.checkIconWrapper}>
                                        <View style={styles.checkIcon}>
                                            <Text style={styles.checkmark}>✓</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.learnText}>
                                        What recent brain research revealed about stress, connection, and bonding
                                    </Text>
                                </View>

                                <View style={styles.learnItem}>
                                    <View style={styles.checkIconWrapper}>
                                        <View style={styles.checkIcon}>
                                            <Text style={styles.checkmark}>✓</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.learnText}>
                                        The new understanding science introduced about supporting children and families
                                    </Text>
                                </View>
                            </View>

                            {/* Bottom tag */}
                            <View style={styles.bottomTag}>
                                <Text style={styles.bottomTagText}>
                                    ⭐ Loved by 98% of parents
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* CTA Button at the bottom of scroll */}
                    <View style={styles.buttonWrapper}>
                        <Button
                            title="See My Full Plan →"
                            onPress={handleContinue}
                            variant="gradient"
                        />
                    </View>
                </ScrollView>
            </View>
        </OnboardingContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 8,
        letterSpacing: -0.8,
    },
    highlightText: {
        color: Colors.primary,
    },
    subtitle: {
        fontSize: 17,
        color: Colors.textTertiary,
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 24,
        fontWeight: Typography.weights.medium,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 28,
        overflow: 'hidden',
        ...Shadows['2xl'],
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    illustrationWrapper: {
        width: '100%',
    },
    illustrationContainer: {
        width: '100%',
        height: 240,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    contentSection: {
        padding: 24,
        paddingTop: 20,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: Colors.primaryBg,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
    },
    badgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        letterSpacing: 0.8,
    },
    lessonTitle: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        lineHeight: 32,
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.borderLight,
        marginBottom: 20,
    },
    learnHeader: {
        fontSize: 13,
        fontWeight: Typography.weights.bold,
        color: Colors.textMuted,
        letterSpacing: 1.2,
        marginBottom: 18,
        textTransform: 'uppercase',
    },
    learnList: {
        gap: 18,
    },
    learnItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkIconWrapper: {
        paddingTop: 2,
    },
    checkIcon: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        ...Shadows.md,
    },
    checkmark: {
        color: Colors.surface,
        fontSize: 15,
        fontWeight: Typography.weights.bold,
    },
    learnText: {
        flex: 1,
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 26,
        fontWeight: Typography.weights.medium,
    },
    bottomTag: {
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        alignItems: 'center',
    },
    bottomTagText: {
        fontSize: 14,
        color: Colors.textMuted,
        fontWeight: Typography.weights.semibold,
    },
    buttonWrapper: {
        marginTop: 20,
    },
});

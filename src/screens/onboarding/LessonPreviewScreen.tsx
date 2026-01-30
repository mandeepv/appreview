import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';


type Props = NativeStackScreenProps<OnboardingStackParamList, 'LessonPreview'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LessonPreviewScreen: React.FC<Props> = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    const handleContinue = () => {
        navigation.navigate('Paywall');
    };

    return (
        <OnboardingContainer
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
                        Your First Lesson <Text style={styles.highlightText}>Awaits</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Let's build the foundation together
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
                                <Image
                                    source={require('../../../assets/onboarding/brain-science-foundation.png')}
                                    style={styles.illustrationImage}
                                    resizeMode="cover"
                                />
                            </LinearGradient>
                        </View>

                        {/* Content Section */}
                        <View style={styles.contentSection}>
                            {/* Badge */}
                            <View style={styles.badge}>
                                <View style={styles.badgeDot} />
                                <Text style={styles.badgeText}>LESSON 1 • FOUNDATION</Text>
                            </View>

                            {/* Lesson Title */}
                            <Text style={styles.lessonTitle}>
                                What changed parenting science?
                            </Text>

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
                                        Why traditional parenting had limited success
                                    </Text>
                                </View>

                                <View style={styles.learnItem}>
                                    <View style={styles.checkIconWrapper}>
                                        <View style={styles.checkIcon}>
                                            <Text style={styles.checkmark}>✓</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.learnText}>
                                        What brain research revealed about stress & bonding
                                    </Text>
                                </View>

                                <View style={styles.learnItem}>
                                    <View style={styles.checkIconWrapper}>
                                        <View style={styles.checkIcon}>
                                            <Text style={styles.checkmark}>✓</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.learnText}>
                                        New science-backed approaches to support families
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Fixed Button at Bottom */}
                <View style={[styles.fixedButtonContainer, { paddingBottom: insets.bottom || 20 }]}>
                    <Button
                        title="Start My First Lesson"
                        onPress={handleContinue}
                        variant="gradient"
                    />
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
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 100,
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    mainTitle: {
        fontSize: 30,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: 6,
        letterSpacing: -0.8,
    },
    highlightText: {
        color: Colors.primary,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textTertiary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
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
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    illustrationImage: {
        width: '100%',
        height: 140,
    },
    contentSection: {
        padding: 20,
        paddingTop: 16,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: Colors.primaryBg,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 12,
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
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        lineHeight: 28,
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    learnHeader: {
        fontSize: 12,
        fontWeight: Typography.weights.bold,
        color: Colors.textMuted,
        letterSpacing: 1.2,
        marginBottom: 14,
        textTransform: 'uppercase',
    },
    learnList: {
        gap: 14,
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
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
        fontWeight: Typography.weights.medium,
    },
});

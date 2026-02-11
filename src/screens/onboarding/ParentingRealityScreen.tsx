import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { Colors, Spacing, Typography } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ParentingReality'>;

export const ParentingRealityScreen: React.FC<Props> = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    const handleContinue = () => {
        navigation.navigate('NotificationPermission');
    };

    return (
        <OnboardingContainer
            screenName="ParentingReality"
            currentStep={9}
            onBack={() => navigation.goBack()}
            centerTitle={true}
            title=""
            scrollable={true}
        >
            <View style={styles.wrapper}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>💙</Text>
                        </View>

                        {/* Headline */}
                        <Text style={styles.headline}>
                            Parenting is hard —{'\n'}and that's normal
                        </Text>

                        {/* Message Card */}
                        <View style={styles.messageCard}>
                            <Text style={styles.messageText}>
                                Feeling overwhelmed, confused, or unsure doesn't mean you're failing.
                            </Text>
                            <Text style={styles.emphasisText}>
                                It means you care.
                            </Text>
                        </View>

                        {/* Reassurance */}
                        <View style={styles.reassuranceCard}>
                            <Text style={styles.reassuranceText}>
                                You're not alone. Many parents feel this way — especially when trying to do better.
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.buttonContainer, { paddingBottom: insets.bottom || 20 }]}>
                    <Button
                        title="Continue"
                        onPress={handleContinue}
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
        flexGrow: 1,
        paddingTop: Spacing['3xl'],
        paddingBottom: 100,
    },
    contentContainer: {
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing['2xl'],
    },
    icon: {
        fontSize: 52,
    },
    headline: {
        fontSize: 30,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing['2xl'],
        lineHeight: 38,
        letterSpacing: -0.5,
    },
    messageCard: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: Spacing['2xl'],
        marginBottom: Spacing.xl,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    messageText: {
        fontSize: 17,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: Spacing.md,
    },
    emphasisText: {
        fontSize: 18,
        color: Colors.primary,
        textAlign: 'center',
        fontWeight: Typography.weights.bold,
        lineHeight: 26,
    },
    reassuranceCard: {
        backgroundColor: Colors.primaryBg,
        borderRadius: 16,
        padding: Spacing.lg,
        paddingHorizontal: Spacing.xl,
    },
    reassuranceText: {
        fontSize: 16,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: Typography.weights.semibold,
    },
    buttonContainer: {
        paddingHorizontal: Spacing['2xl'],
        paddingTop: Spacing.md,
    },
});

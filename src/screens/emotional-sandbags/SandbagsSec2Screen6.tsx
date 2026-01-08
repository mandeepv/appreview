import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec2Screen6'>;

export const SandbagsSec2Screen6: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SandbagsSec2Screen7');
    };

    return (
        <LessonContainer
            currentStep={6}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.headline}>This is how deep bonds are built</Text>

                    <View style={styles.scienceBadge}>
                        <Ionicons name="flask-outline" size={20} color={Colors.primary} />
                        <Text style={styles.scienceText}>RESEARCH BACKED</Text>
                    </View>

                    <Text style={styles.body}>
                        Research shows that helping someone process emotions empathically is one of the most powerful ways to build deep, lasting bonds.
                    </Text>

                    <View style={styles.mutualityCard}>
                        <Text style={styles.mutualityTitle}>In healthy relationships, this goes both ways:</Text>

                        <View style={styles.loopContainer}>
                            <View style={styles.loopItem}>
                                <Ionicons name="people" size={24} color="#5C6BC0" />
                                <Text style={styles.loopText}>When <Text style={styles.bold}>they’re</Text> struggling, you support them</Text>
                            </View>

                            <Ionicons name="swap-vertical" size={24} color={Colors.border} style={styles.swapIcon} />

                            <View style={styles.loopItem}>
                                <Ionicons name="person" size={24} color="#66BB6A" />
                                <Text style={styles.loopText}>When <Text style={styles.bold}>you’re</Text> struggling, they support you</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.payoffBox}>
                        <Text style={styles.payoffText}>Both people feel <Text style={styles.boldPayoff}>purpose, closeness, and trust</Text>.</Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Check your understanding"
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
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 34,
    },
    scienceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        alignSelf: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: Colors.primaryBg,
    },
    scienceText: {
        fontSize: 12,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        letterSpacing: 1,
    },
    body: {
        fontSize: 17,
        color: Colors.textSecondary,
        lineHeight: 28,
        textAlign: 'center',
    },
    mutualityCard: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: BorderRadius.xl,
        ...Shadows.sm,
        gap: 20,
    },
    mutualityTitle: {
        fontSize: 16,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    loopContainer: {
        gap: 12,
        alignItems: 'center',
    },
    loopItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        width: '100%',
        paddingHorizontal: 10,
    },
    loopText: {
        fontSize: 15,
        color: Colors.textSecondary,
        flex: 1,
    },
    swapIcon: {
        marginVertical: -8,
    },
    payoffBox: {
        marginTop: 10,
        padding: 16,
        backgroundColor: '#E8F5E9',
        borderRadius: BorderRadius.lg,
    },
    payoffText: {
        fontSize: 16,
        color: '#2E7D32',
        textAlign: 'center',
        lineHeight: 24,
    },
    bold: {
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    boldPayoff: {
        fontWeight: Typography.weights.bold,
    },
    buttonContainer: {
        width: '100%',
    },
});

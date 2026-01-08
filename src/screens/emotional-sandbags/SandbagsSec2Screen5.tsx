import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec2Screen5'>;

export const SandbagsSec2Screen5: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SandbagsSec2Screen6');
    };

    const results = [
        { label: 'We feel relief', icon: 'leaf-outline', color: '#4CAF50' },
        { label: 'We feel understood', icon: 'chatbubble-outline', color: '#2196F3' },
        { label: 'We feel lighter', icon: 'cloud-outline', color: '#00BCD4' },
    ];

    return (
        <LessonContainer
            currentStep={5}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.headline}>What happens after the sand is released</Text>

                    <Text style={styles.subtext}>When someone helps us process our emotions:</Text>

                    <View style={styles.resultsGrid}>
                        {results.map((item, index) => (
                            <View key={index} style={styles.resultItem}>
                                <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                                    <Ionicons name={item.icon as any} size={32} color={item.color} />
                                </View>
                                <Text style={styles.resultLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.bondingCard}>
                        <Text style={styles.bondingText}>
                            And almost automatically, we feel <Text style={styles.bold}>love and connection</Text> toward the person who helped us.
                        </Text>
                        <View style={styles.divider} />
                        <Text style={styles.logicText}>
                            This is not accidental. It’s <Text style={styles.bold}>how bonding works</Text>.
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="There’s science behind this"
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
        paddingHorizontal: 24,
        gap: 24,
    },
    headline: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 34,
    },
    subtext: {
        fontSize: 17,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    resultsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
        marginVertical: 10,
    },
    resultItem: {
        width: '45%',
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        gap: 12,
        ...Shadows.sm,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    bondingCard: {
        backgroundColor: '#FFF0F5',
        padding: 24,
        borderRadius: BorderRadius.xl,
        gap: 16,
        borderWidth: 1,
        borderColor: '#FFD1DC',
    },
    bondingText: {
        fontSize: 18,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 28,
    },
    divider: {
        height: 1,
        backgroundColor: '#FFD1DC',
    },
    logicText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    bold: {
        fontWeight: Typography.weights.bold,
        color: '#E91E63',
    },
    buttonContainer: {
        width: '100%',
    },
});

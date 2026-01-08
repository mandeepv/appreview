import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec1Screen3'>;

export const SprinklersSec1Screen3: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec1Screen4');
    };

    return (
        <LessonContainer
            currentStep={3}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.header}>
                        Is building deep bonds really that important?
                    </Text>

                    <Text style={styles.subtext}>
                        Study after study shows that children who have deep emotional bonds:
                    </Text>

                    <View style={styles.cardContainer}>
                        {[
                            'Get better grades',
                            'Live longer',
                            'Whine less',
                            'Have longer attention spans',
                            'Have fewer discipline problems',
                            'Solve more of their own problems'
                        ].map((item, index) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardIcon}>✨</Text>
                                <Text style={styles.cardText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <Button
                        title="That matters →"
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
    },
    scrollContent: {
        paddingBottom: 20,
        paddingTop: 10,
    },
    header: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: 34,
    },
    subtext: {
        fontSize: 16,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 24,
    },
    cardContainer: {
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        ...Shadows.sm,
    },
    cardIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    cardText: {
        fontSize: 16,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
        flex: 1,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
        paddingTop: 10,
    },
});

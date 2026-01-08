import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec1Screen4'>;

export const SprinklersSec1Screen4: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec1Screen5');
    };

    return (
        <LessonContainer
            currentStep={4}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.header}>
                        So what actually builds deep bonds?
                    </Text>

                    <View style={styles.section}>
                        <Text style={styles.body}>
                            Most people assume relationships are built during happy moments — like vacations or playtime.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.body}>
                            But research shows that relationships are mostly built or torn down during moments when our loved ones are <Text style={styles.highlight}>emotionally upset</Text>.
                        </Text>
                    </View>

                    <View style={styles.quoteContainer}>
                        <Text style={styles.quote}>
                            "It’s how we respond during these moments that defines the relationship."
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="This surprised me →"
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
    content: {
        flex: 1,
        paddingTop: 10,
        gap: 24,
    },
    header: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    section: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        padding: 2,
        borderRadius: 8,
    },
    body: {
        fontSize: 17,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        lineHeight: 26,
        textAlign: 'center',
    },
    highlight: {
        color: Colors.primary,
        fontWeight: Typography.weights.bold,
    },
    quoteContainer: {
        backgroundColor: '#FFE4ED',
        padding: 24,
        borderRadius: 16,
        marginTop: 10,
        ...Shadows.sm,
    },
    quote: {
        fontSize: 20,
        fontWeight: Typography.weights.semibold,
        color: '#C2185B',
        lineHeight: 30,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

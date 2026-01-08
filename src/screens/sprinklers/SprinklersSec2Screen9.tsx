import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen9'>;

export const SprinklersSec2Screen9: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec2Screen10');
    };

    return (
        <LessonContainer
            currentStep={9}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.spacer} />

                <View style={styles.content}>
                    <Text style={styles.headline}>
                        What kids hear when we minimize
                    </Text>

                    <View style={styles.quotesContainer}>
                        <View style={styles.quoteItem}>
                            <Text style={styles.quoteText}>“You’re overreacting.”</Text>
                        </View>
                        <View style={styles.quoteItem}>
                            <Text style={styles.quoteText}>“It’s just a toy.”</Text>
                        </View>
                    </View>

                    <Text style={styles.body}>
                        Kids don’t learn to calm down. They learn:
                    </Text>

                    <View style={styles.lessonsContainer}>
                        <View style={styles.lessonItem}>
                            <Text style={styles.lessonText}>“My feelings are wrong.”</Text>
                        </View>
                        <View style={styles.lessonItem}>
                            <Text style={styles.lessonText}>“I’m bad at emotions.”</Text>
                        </View>
                    </View>

                    <Text style={styles.footer}>
                        Over time, this makes them less likely to come to us.
                    </Text>
                </View>

                <View style={styles.spacer} />

                <View style={styles.buttonContainer}>
                    <Button
                        title="Next →"
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
    spacer: {
        flex: 1,
    },
    content: {
        gap: 20,
        alignItems: 'center',
    },
    headline: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    quotesContainer: {
        width: '100%',
        gap: 12,
    },
    quoteItem: {
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 12,
    },
    quoteText: {
        fontSize: 16,
        color: '#D32F2F',
        fontWeight: Typography.weights.bold,
        textAlign: 'center',
    },
    body: {
        fontSize: 17,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    lessonsContainer: {
        width: '100%',
        gap: 12,
    },
    lessonItem: {
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    lessonText: {
        fontSize: 16,
        color: Colors.textPrimary,
        textAlign: 'center',
        fontWeight: Typography.weights.semibold,
    },
    footer: {
        fontSize: 15,
        color: Colors.textTertiary,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

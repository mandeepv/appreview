import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec1Screen7'>;

export const SprinklersSec1Screen7: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec1Screen8');
    };

    return (
        <LessonContainer
            currentStep={7}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.header}>
                        This applies to adults too
                    </Text>

                    <View style={styles.emojiContainer}>
                        <Text style={styles.emoji}>👫</Text>
                    </View>

                    <Text style={styles.body}>
                        The same science applies to romantic partners.
                    </Text>

                    <View style={styles.highlightBox}>
                        <Text style={styles.highlightText}>
                            Deep bonds are not built by gifts, compliments, or vacations alone —
                        </Text>
                        <View style={styles.divider} />
                        <Text style={[styles.highlightText, styles.boldText]}>
                            they are built when we help our partner during emotional or upset moments.
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Show me"
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
        alignItems: 'center',
    },
    header: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    emojiContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    emoji: {
        fontSize: 50,
    },
    body: {
        fontSize: 18,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
    },
    highlightBox: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 16,
        width: '100%',
        ...Shadows.sm,
    },
    highlightText: {
        fontSize: 16,
        color: Colors.textPrimary,
        lineHeight: 24,
        textAlign: 'center',
    },
    boldText: {
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 16,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

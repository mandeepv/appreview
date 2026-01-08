import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec1Screen9'>;

export const SprinklersSec1Screen9: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec1Screen10');
    };

    return (
        <LessonContainer
            currentStep={9}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>The good news</Text>

                    <Text style={styles.body}>
                        Emotional moments don’t have to feel overwhelming.
                    </Text>

                    <View style={styles.highlightBox}>
                        <Text style={styles.highlightTitle}>There are simple, learnable tools that make these moments:</Text>

                        <View style={styles.list}>
                            <View style={styles.listItem}>
                                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                                <Text style={styles.listItemText}>Easier</Text>
                            </View>
                            <View style={styles.listItem}>
                                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                                <Text style={styles.listItemText}>Calmer</Text>
                            </View>
                            <View style={styles.listItem}>
                                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                                <Text style={styles.listItemText}>More connecting</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.bridgeLine}>
                        And learning these tools can dramatically change your relationship with your child.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Learn the tools →"
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
    title: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    body: {
        fontSize: 18,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
    },
    highlightBox: {
        backgroundColor: '#E3F2FF',
        padding: 24,
        borderRadius: 16,
        gap: 16,
        ...Shadows.sm,
    },
    highlightTitle: {
        fontSize: 16,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 22,
    },
    list: {
        gap: 12,
        alignItems: 'center',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
        width: '100%',
    },
    listItemText: {
        fontSize: 16,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    bridgeLine: {
        fontSize: 16,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 24,
        fontStyle: 'italic',
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

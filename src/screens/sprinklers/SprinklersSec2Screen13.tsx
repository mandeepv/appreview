import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec2Screen13'>;

export const SprinklersSec2Screen13: React.FC<Props> = ({ navigation }) => {
    const handleComplete = async () => {
        // Mark section as complete
        try {
            const STORAGE_KEY = '@sprinklers_completed_sections';
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            let completedSections = stored ? JSON.parse(stored) : [];
            if (!completedSections.includes('2')) {
                completedSections.push('2');
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedSections));
            }
        } catch (error) {
            if (__DEV__) console.error('Error saving progress:', error);
        }

        navigation.navigate('SprinklersLesson' as any);
    };

    return (
        <LessonContainer
            currentStep={13}
            totalSteps={13}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.headline}>
                        When kids are in the sprinkler of emotions…
                    </Text>

                    <View style={styles.checklist}>
                        <View style={styles.checkItem}>
                            <Ionicons name="close-circle" size={24} color={Colors.error} />
                            <Text style={styles.checkText}>Don’t problem solve</Text>
                        </View>
                        <View style={styles.checkItem}>
                            <Ionicons name="close-circle" size={24} color={Colors.error} />
                            <Text style={styles.checkText}>Don’t minimize</Text>
                        </View>
                        <View style={styles.checkItem}>
                            <Ionicons name="close-circle" size={24} color={Colors.error} />
                            <Text style={styles.checkText}>Don’t take the other side</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.checkItem}>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                            <Text style={styles.checkText}>Do connect emotionally</Text>
                        </View>
                        <View style={styles.checkItem}>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                            <Text style={styles.checkText}>Do show you’re on their team</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Next section →"
                        onPress={handleComplete}
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
        gap: 32,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headline: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 32,
    },
    checklist: {
        backgroundColor: Colors.surface,
        padding: 24,
        borderRadius: 24,
        gap: 16,
        ...Shadows.md,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkText: {
        fontSize: 17,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 8,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

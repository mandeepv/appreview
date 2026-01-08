import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen3'>;

export const SprinklersSec3Screen3: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec3Screen4');
    };

    return (
        <LessonContainer
            currentStep={3}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="flash" size={32} color="#E53935" />
                    </View>
                    <Text style={styles.headline}>Phase 1: The Primitive Brain Phase</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.subheadline}>When someone is in this phase:</Text>

                    <View style={styles.list}>
                        {[
                            'Fight-or-flight is active',
                            'Rational thinking is offline',
                            'Teaching will not work'
                        ].map((item, index) => (
                            <View key={index} style={styles.listItem}>
                                <Ionicons name="close-circle" size={20} color="#E53935" />
                                <Text style={styles.listText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                            This is where most well-meaning parents accidentally make things worse.
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Next"
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
    header: {
        alignItems: 'center',
        paddingTop: 20,
        gap: 12,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headline: {
        fontSize: 22,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 32,
    },
    subheadline: {
        fontSize: 18,
        fontWeight: Typography.weights.semibold,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    list: {
        gap: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        gap: 12,
        ...Shadows.sm,
    },
    listText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: Typography.weights.medium,
    },
    warningBox: {
        backgroundColor: '#FFF9C4',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FBC02D',
    },
    warningText: {
        fontSize: 16,
        color: '#F9A825',
        fontWeight: Typography.weights.bold,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

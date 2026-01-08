import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec3Screen12'>;

export const SprinklersSec3Screen12: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec3Screen13');
    };

    return (
        <LessonContainer
            currentStep={12}
            totalSteps={14}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.spacer} />

                <View style={styles.content}>
                    <Text style={styles.headline}>Advice & limits</Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>As long as the logical brain stays active:</Text>

                        <View style={styles.list}>
                            {[
                                'You can give a little advice',
                                'You can remind about expectations',
                                'You can set limits or consequences if needed'
                            ].map((item, index) => (
                                <View key={index} style={styles.listItem}>
                                    <Ionicons name="bulb" size={20} color="#FBC02D" />
                                    <Text style={styles.listText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.keyLine}>
                        <Text style={styles.keyText}>
                            Advice works <Text style={styles.bold}>only now</Text>, not earlier.
                        </Text>
                    </View>
                </View>

                <View style={styles.spacer} />

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
    spacer: {
        flex: 1,
    },
    content: {
        gap: 32,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    headline: {
        fontSize: 26,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    infoBox: {
        backgroundColor: '#FFFDE7',
        padding: 24,
        borderRadius: 20,
        gap: 20,
        width: '100%',
        ...Shadows.sm,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: Typography.weights.bold,
        color: '#FBC02D',
    },
    list: {
        gap: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    listText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: Typography.weights.medium,
        lineHeight: 22,
        flex: 1,
    },
    keyLine: {
        paddingTop: 10,
    },
    keyText: {
        fontSize: 18,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    bold: {
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

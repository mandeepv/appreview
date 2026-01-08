import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec1Screen5'>;

export const SprinklersSec1Screen5: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec1Screen6');
    };

    return (
        <LessonContainer
            currentStep={5}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.header}>
                        This surprises almost every parent
                    </Text>

                    <Text style={styles.body}>
                        Many parents think of emotional moments as something to survive:
                    </Text>

                    <View style={styles.listContainer}>
                        {[
                            'Tantrums',
                            'Tears',
                            'Frustration',
                            'Meltdowns'
                        ].map((item, index) => (
                            <View key={index} style={styles.listItem}>
                                <Ionicons name="alert-circle" size={20} color={Colors.error} />
                                <Text style={styles.listItemText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.insightBox}>
                        <Text style={styles.insightLabel}>BUT SCIENCE IS CLEAR:</Text>
                        <Text style={styles.insightText}>
                            These moments are actually opportunities to build deep bonds.
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Okay, but how? →"
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
    body: {
        fontSize: 17,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
    },
    listContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FFE0E0',
    },
    listItemText: {
        fontSize: 15,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
    },
    insightBox: {
        backgroundColor: '#E8F5E9',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        ...Shadows.sm,
    },
    insightLabel: {
        fontSize: 12,
        fontWeight: Typography.weights.bold,
        color: '#2E7D32',
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    insightText: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
        color: '#1B5E20',
        textAlign: 'center',
        lineHeight: 26,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

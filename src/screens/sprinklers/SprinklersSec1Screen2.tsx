import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SprinklersSec1Screen2'>;

export const SprinklersSec1Screen2: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SprinklersSec1Screen3');
    };

    return (
        <LessonContainer
            currentStep={2}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.prompt}>
                        When you think of bonding with your child, what comes to mind?
                    </Text>

                    <View style={styles.listContainer}>
                        {[
                            'Going to the park',
                            'Playing sports or games',
                            'One-on-one time',
                            'Family dinners'
                        ].map((item, index) => (
                            <View key={index} style={styles.listItem}>
                                <Ionicons name="ellipse" size={8} color={Colors.primary} style={styles.bullet} />
                                <Text style={styles.listItemText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.footerText}>
                        These do matter — but they’re not what builds the deepest bonds.
                    </Text>
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
    content: {
        flex: 1,
        paddingTop: 20,
        gap: 32,
    },
    prompt: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        lineHeight: 34,
        textAlign: 'center',
    },
    listContainer: {
        gap: 16,
        paddingHorizontal: 20,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    bullet: {
        marginRight: 12,
    },
    listItemText: {
        fontSize: 16,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
    },
    footerText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 20,
    },
    buttonContainer: {
        paddingBottom: 20,
        width: '100%',
    },
});

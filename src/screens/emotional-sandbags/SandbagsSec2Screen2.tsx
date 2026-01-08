import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<LessonStackParamList, 'SandbagsSec2Screen2'>;

export const SandbagsSec2Screen2: React.FC<Props> = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate('SandbagsSec2Screen3');
    };

    const reactions = [
        'Leave them alone',
        'Say “Tomorrow will be better”',
        'Try to cheer them up',
        'Fix the problem',
        'Put things in perspective',
    ];

    return (
        <LessonContainer
            currentStep={2}
            totalSteps={10}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.headline}>Most of us instinctively try one of these</Text>

                    <View style={styles.listContainer}>
                        {reactions.map((reaction, index) => (
                            <View key={index} style={styles.listItem}>
                                <Ionicons name="close-circle" size={20} color="#FF5252" />
                                <Text style={styles.listText}>{reaction}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.insightBox}>
                        <Text style={styles.insightText}>
                            These reactions feel helpful — but they often miss what the person <Text style={styles.bold}>actually needs</Text>.
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Here’s what’s really going on"
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
        paddingBottom: 20,
    },
    content: {
        paddingTop: 20,
        paddingHorizontal: 24,
        gap: 32,
    },
    headline: {
        fontSize: 24,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 32,
    },
    listContainer: {
        gap: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        padding: 16,
        borderRadius: BorderRadius.lg,
        gap: 12,
    },
    listText: {
        fontSize: 17,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
    },
    insightBox: {
        marginTop: 10,
        padding: 24,
        backgroundColor: Colors.primaryBg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    insightText: {
        fontSize: 18,
        color: Colors.textPrimary,
        lineHeight: 28,
        textAlign: 'center',
    },
    bold: {
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    buttonContainer: {
        width: '100%',
    },
});

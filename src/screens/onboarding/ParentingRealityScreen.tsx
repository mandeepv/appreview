import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ParentingReality'>;

export const ParentingRealityScreen: React.FC<Props> = ({ navigation }) => {
    const handleContinue = () => {
        navigation.navigate('NotificationPermission');
    };

    return (
        <OnboardingContainer
            currentStep={9}
            onBack={() => navigation.goBack()}
            centerTitle={true}
            title=""
        >
            <View style={styles.container}>
                <View style={styles.contentContainer}>
                    {/* Optional: Add an icon or illustration here if consistent with other screens, 
              but user didn't specify one. A heart or supportive icon might be nice. */}
                    <Text style={styles.icon}>❤️</Text>

                    <Text style={styles.headline}>Parenting is hard — and that’s normal</Text>

                    <Text style={styles.body}>
                        Feeling overwhelmed, confused, or unsure doesn’t mean you’re failing.
                        {'\n'}
                        It means you care.
                    </Text>

                    <Text style={styles.bodyBold}>
                        Many parents feel this way — especially when trying to do better.
                    </Text>
                </View>

                <Button
                    title="Continue →"
                    onPress={handleContinue}
                    style={styles.button}
                />
            </View>
        </OnboardingContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        justifyContent: 'space-between',
    },
    contentContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    icon: {
        fontSize: 48,
        marginBottom: 24,
    },
    headline: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 36,
    },
    body: {
        fontSize: 18,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 24,
    },
    bodyBold: {
        fontSize: 18,
        color: '#111827',
        textAlign: 'center',
        lineHeight: 28,
        fontWeight: '600',
    },
    button: {
        marginTop: 'auto',
    },
});

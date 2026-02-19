import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormInput';
import { CounterSelector } from '../../components/CounterSelector';
import { Caption } from '../../components/Typography';
import { useOnboardingStore } from '../../store/onboardingStore';
import { Spacing, Animation as AnimationConfig } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'NameAge'>;

export const NameAgeScreen: React.FC<Props> = ({ navigation }) => {
    const { name: storedName, age: storedAge, updateNameAndAge } = useOnboardingStore();
    const [name, setName] = useState(storedName);
    const [age, setAge] = useState<number>(storedAge || 30);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: AnimationConfig.duration.slow,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleContinue = () => {
        if (age > 0) {
            updateNameAndAge(name.trim() || 'Parent', age);
            navigation.navigate('ChildrenCount');
        }
    };

    const incrementAge = () => setAge(prev => Math.min(100, prev + 1));
    const decrementAge = () => setAge(prev => Math.max(18, prev - 1));

    const isValid = age > 0;
    const hasName = name.trim().length > 0;

    return (
        <OnboardingContainer
            screenName="NameAge"
            title="Let's personalize this for you"
            subtitle="So examples feel relevant to your life"
            currentStep={2}
            onBack={() => navigation.goBack()}
            scrollable={true}
            centerTitle={true}
            avoidKeyboard={false}
        >
            <View style={styles.container}>
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    <FormInput
                        label="Your Name"
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                        returnKeyType="done"
                        characterLimit={50}
                        showCharacterCount={false}
                        success={hasName}
                    />

                    <CounterSelector
                        label="Your Age"
                        value={age}
                        onIncrement={incrementAge}
                        onDecrement={decrementAge}
                        min={18}
                        max={100}
                    />
                </Animated.View>

                <Button
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!isValid}
                    variant="gradient"
                />
            </View>
        </OnboardingContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: Spacing['2xl'],
    },
    content: {
        gap: Spacing['2xl'],
    },
    microcopy: {
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
});

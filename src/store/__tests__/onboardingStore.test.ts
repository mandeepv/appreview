// SPEC-20 R6 — the onboarding store's persistence. The launch-time re-save
// depends on it: a payload stranded by a failed upsert is reloaded by Splash
// and re-sent by Loading, and clearState is the only thing that ends that
// loop (it also drops the resume markers, or a logged-out user is sent back
// into the questionnaire — Fable review #3).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingStore } from '../onboardingStore';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { onboardingAnswers } from '../../test/factories';
import { seedOnboardingStore } from '../../test/stores';

const store = () => useOnboardingStore.getState();

beforeEach(async () => {
  await AsyncStorage.clear();
  seedOnboardingStore();
});

describe('onboarding store persistence', () => {
  it('saveState → loadState round-trips every answer', async () => {
    const answers = onboardingAnswers();
    seedOnboardingStore(answers as never);
    await store().saveState();

    seedOnboardingStore(); // a fresh launch: memory empty
    const loaded = await store().loadState();

    expect(loaded).toEqual(answers);
    expect(store().userType).toBe('parent');
    expect(store().children).toEqual(answers.children);
  });

  it('loadState with nothing saved → null, store untouched', async () => {
    await expect(store().loadState()).resolves.toBeNull();
    expect(store().userType).toBeNull();
  });

  it('corrupt saved JSON → null and defaults, never a throw', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, '{not json');
    await expect(store().loadState()).resolves.toBeNull();
    expect(store().userType).toBeNull();
  });

  it('clearState removes the answers AND both resume markers, and resets memory', async () => {
    seedOnboardingStore(onboardingAnswers() as never);
    await store().saveState();
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_LAST_SCREEN, 'NameAge');
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_HAS_REACHED_AUTH, 'true');

    await store().clearState();

    expect(await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE)).toBeNull();
    expect(await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_LAST_SCREEN)).toBeNull();
    expect(await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_HAS_REACHED_AUTH)).toBeNull();
    expect(store().userType).toBeNull();
    expect(store().name).toBe('');
  });
});

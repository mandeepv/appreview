/* eslint-disable import/first -- jest.mock() must be hoisted above imports. */
// SPEC-15 R6 — variantBAnswers round-trips through save / load / clear.
//
// The onboardingStore imports AsyncStorage as a DEFAULT import and uses
// setItem / getItem / multiRemove, so the mock exposes all three plus a
// __esModule default.

const mockStore: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((k: string) => Promise.resolve(mockStore[k] ?? null)),
    setItem: jest.fn((k: string, v: string) => {
      mockStore[k] = v;
      return Promise.resolve();
    }),
    removeItem: jest.fn((k: string) => {
      delete mockStore[k];
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys: string[]) => {
      keys.forEach((k) => delete mockStore[k]);
      return Promise.resolve();
    }),
  },
}));

import { useOnboardingStore } from '../onboardingStore';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const STATE_KEY = STORAGE_KEYS.ONBOARDING_STATE;

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
  useOnboardingStore.getState().reset();
});

describe('variantBAnswers', () => {
  it('starts empty', () => {
    expect(useOnboardingStore.getState().variantBAnswers).toEqual({});
  });

  it('setVariantBAnswer merges per-screen (single + multi select)', () => {
    const { setVariantBAnswer } = useOnboardingStore.getState();
    setVariantBAnswer('VariantBQ1', 'placeholder_a');
    setVariantBAnswer('VariantBQ2', ['placeholder_a', 'placeholder_c']);
    expect(useOnboardingStore.getState().variantBAnswers).toEqual({
      VariantBQ1: 'placeholder_a',
      VariantBQ2: ['placeholder_a', 'placeholder_c'],
    });
  });

  it('re-answering a screen overwrites only that screen key', () => {
    const { setVariantBAnswer } = useOnboardingStore.getState();
    setVariantBAnswer('VariantBQ1', 'placeholder_a');
    setVariantBAnswer('VariantBQ1', 'placeholder_b');
    expect(useOnboardingStore.getState().variantBAnswers).toEqual({
      VariantBQ1: 'placeholder_b',
    });
  });

  it('round-trips through save → (reset) → load', async () => {
    const store = useOnboardingStore.getState();
    store.setVariantBAnswer('VariantBQ1', 'placeholder_a');
    store.setVariantBAnswer('VariantBQ2', ['placeholder_b']);
    await store.saveState();

    // Persisted JSON carries the answers.
    expect(JSON.parse(mockStore[STATE_KEY]).variantBAnswers).toEqual({
      VariantBQ1: 'placeholder_a',
      VariantBQ2: ['placeholder_b'],
    });

    // Wipe in-memory, reload from storage.
    store.reset();
    expect(useOnboardingStore.getState().variantBAnswers).toEqual({});
    await useOnboardingStore.getState().loadState();
    expect(useOnboardingStore.getState().variantBAnswers).toEqual({
      VariantBQ1: 'placeholder_a',
      VariantBQ2: ['placeholder_b'],
    });
  });

  it('clearState empties variantBAnswers and removes the persisted blob', async () => {
    const store = useOnboardingStore.getState();
    store.setVariantBAnswer('VariantBQ1', 'placeholder_a');
    await store.saveState();
    await useOnboardingStore.getState().clearState();
    expect(useOnboardingStore.getState().variantBAnswers).toEqual({});
    expect(mockStore[STATE_KEY]).toBeUndefined();
  });
});

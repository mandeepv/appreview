// SPEC-09 Phase 3 — the progress-store factory.
//
// The 8 hand-written src/utils/*Progress.ts modules were byte-identical apart
// from their storage key: each exposed markSectionComplete / getCompletedSections
// / reset*, storing a JSON array of completed section-id strings under one key.
// `createProgressStore(storageKey)` replaces all 8 with one factory.
//
// BYTE-COMPATIBLE: same key, same JSON format (an array of section-id strings),
// same idempotent append. Existing users' progress survives untouched — the
// key and value shape are identical to what the old utils wrote (round-trip
// verified in progressStore.test.ts).

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProgressStore {
  /** Append a section id to the completed array (idempotent). */
  markSectionComplete: (sectionId: string) => Promise<void>;
  /** Read the completed section-id array (empty on none / error). */
  getCompletedSections: () => Promise<string[]>;
  /** Clear all progress for this lesson. */
  reset: () => Promise<void>;
}

export function createProgressStore(storageKey: string): ProgressStore {
  return {
    markSectionComplete: async (sectionId: string): Promise<void> => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        const completed: string[] = stored ? JSON.parse(stored) : [];
        if (!completed.includes(sectionId)) {
          completed.push(sectionId);
          await AsyncStorage.setItem(storageKey, JSON.stringify(completed));
        }
      } catch (error) {
        if (__DEV__) console.error('Error marking section complete:', error);
      }
    },

    getCompletedSections: async (): Promise<string[]> => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        if (__DEV__) console.error('Error getting completed sections:', error);
        return [];
      }
    },

    reset: async (): Promise<void> => {
      try {
        await AsyncStorage.removeItem(storageKey);
      } catch (error) {
        if (__DEV__) console.error('Error resetting progress:', error);
      }
    },
  };
}

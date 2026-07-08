import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

const STORAGE_KEY = STORAGE_KEYS.DISSOCIATION_COMPLETED_SECTIONS;

export const markSectionComplete = async (sectionId: string): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const completed = stored ? JSON.parse(stored) : [];

    if (!completed.includes(sectionId)) {
      completed.push(sectionId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }
  } catch (error) {
    if (__DEV__) console.error('Error marking section complete:', error);
  }
};

export const getCompletedSections = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    if (__DEV__) console.error('Error getting completed sections:', error);
    return [];
  }
};

export const resetDissociationProgress = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    if (__DEV__) console.error('Error resetting progress:', error);
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@lesson5_completed_sections';

export const markSectionComplete = async (sectionId: string): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const completedSections: string[] = stored ? JSON.parse(stored) : [];

    if (!completedSections.includes(sectionId)) {
      completedSections.push(sectionId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedSections));
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

export const resetLesson5Progress = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    if (__DEV__) console.error('Error resetting progress:', error);
  }
};

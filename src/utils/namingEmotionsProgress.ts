import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@naming_emotions_completed_sublessons';

export const markSubLessonComplete = async (subLessonId: string): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const completedSubLessons: string[] = stored ? JSON.parse(stored) : [];

    if (!completedSubLessons.includes(subLessonId)) {
      completedSubLessons.push(subLessonId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedSubLessons));
    }
  } catch (error) {
    if (__DEV__) console.error('Error marking sub-lesson complete:', error);
  }
};

export const getCompletedSubLessons = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    if (__DEV__) console.error('Error getting completed sub-lessons:', error);
    return [];
  }
};

export const areAllSubLessonsComplete = async (): Promise<boolean> => {
  try {
    const completed = await getCompletedSubLessons();
    return completed.length === 4; // 4 sub-lessons total
  } catch (error) {
    if (__DEV__) console.error('Error checking if all sub-lessons complete:', error);
    return false;
  }
};

export const resetNamingEmotionsProgress = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    if (__DEV__) console.error('Error resetting progress:', error);
  }
};

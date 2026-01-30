import { supabase } from '../lib/supabase';

export interface LessonProgress {
  id?: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Mark a lesson as completed
 */
export const markLessonComplete = async (lessonId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      );

    if (error) throw error;
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    throw error;
  }
};

/**
 * Check if a lesson is completed
 */
export const isLessonCompleted = async (lessonId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('lesson_progress')
      .select('completed')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

    if (error) {
      // If not found, lesson is not completed
      if (error.code === 'PGRST116') {
        return false;
      }
      throw error;
    }

    return data?.completed || false;
  } catch (error) {
    console.error('Error checking lesson completion:', error);
    return false;
  }
};

/**
 * Get all completed lessons for the current user
 */
export const getCompletedLessons = async (): Promise<string[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('completed', true);

    if (error) throw error;

    return data?.map((item) => item.lesson_id) || [];
  } catch (error) {
    console.error('Error getting completed lessons:', error);
    return [];
  }
};

/**
 * Get lesson progress for a specific lesson
 */
export const getLessonProgress = async (lessonId: string): Promise<LessonProgress | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as LessonProgress;
  } catch (error) {
    console.error('Error getting lesson progress:', error);
    return null;
  }
};

/**
 * Reset progress for a specific lesson
 */
export const resetLessonProgress = async (lessonId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('lesson_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId);

    if (error) throw error;
  } catch (error) {
    console.error('Error resetting lesson progress:', error);
    throw error;
  }
};

/**
 * Reset all progress for the current user
 */
export const resetAllProgress = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('lesson_progress')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error resetting all progress:', error);
    throw error;
  }
};

/**
 * Get progress statistics
 */
export const getProgressStats = async (): Promise<{
  totalCompleted: number;
  totalLessons: number;
  percentComplete: number;
}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        totalCompleted: 0,
        totalLessons: 13, // Total number of lessons in the app
        percentComplete: 0,
      };
    }

    const { count, error } = await supabase
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    if (error) throw error;

    const totalCompleted = count || 0;
    const totalLessons = 13;
    const percentComplete = Math.round((totalCompleted / totalLessons) * 100);

    return {
      totalCompleted,
      totalLessons,
      percentComplete,
    };
  } catch (error) {
    console.error('Error getting progress stats:', error);
    return {
      totalCompleted: 0,
      totalLessons: 13,
      percentComplete: 0,
    };
  }
};

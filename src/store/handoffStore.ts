import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

// SPEC-21 purchase handoff — the key waiting to be redeemed, and the one-time
// greeting it earns. IN MEMORY ONLY, deliberately:
//
//   - The key is a login credential (INVARIANTS #29). A navigation param is
//     the obvious way to hand it to HandoffScreen, and the wrong one —
//     navigation state is recorded by analytics and crash tooling. Persisting
//     it would leave a live credential on disk. So it sits here until
//     HandoffScreen takes it, and a quit before then simply drops it (the
//     buyer still has the link, and the email code).
//   - The greeting is "You're all set" on Learn, once, right after a redeem.
//     A restart forgetting it is correct: by then it's not news.
//
// The paste-screen flag is the one thing that IS on disk, because it must
// outlive launches: see STORAGE_KEYS.HANDOFF_PROMPT_DONE.

/** Where a key came from, for the handoff_redeemed event. */
export type HandoffSource = 'clipboard' | 'link';

interface HandoffState {
  pendingKey: string | null;
  pendingSource: HandoffSource | null;
  greetingPending: boolean;
  /** A key has arrived (pasted, or a link opened the app). Replaces any earlier one. */
  receive: (key: string, source: HandoffSource) => void;
  /** Hand the pending key to its one consumer, and forget it. */
  take: () => { key: string; source: HandoffSource } | null;
  /** A redeem signed someone in; Learn says so once. */
  setGreetingPending: () => void;
  /** True exactly once after setGreetingPending. */
  consumeGreeting: () => boolean;
}

export const useHandoffStore = create<HandoffState>((set, get) => ({
  pendingKey: null,
  pendingSource: null,
  greetingPending: false,

  receive: (key, source) => set({ pendingKey: key, pendingSource: source }),

  take: () => {
    const { pendingKey, pendingSource } = get();
    if (!pendingKey || !pendingSource) return null;
    set({ pendingKey: null, pendingSource: null });
    return { key: pendingKey, source: pendingSource };
  },

  setGreetingPending: () => set({ greetingPending: true }),

  consumeGreeting: () => {
    if (!get().greetingPending) return false;
    set({ greetingPending: false });
    return true;
  },
}));

/**
 * Has this install already been past the paste screen (or had a signed-in
 * user)? A read failure answers yes: missing the offer costs a buyer one tap
 * on the welcome page's link; showing it wrongly puts a puzzling screen in
 * front of an organic user.
 */
export async function isHandoffPromptDone(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEYS.HANDOFF_PROMPT_DONE)) === 'true';
  } catch {
    return true;
  }
}

/** Never offer the paste screen on this install again. Never throws. */
export async function markHandoffPromptDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HANDOFF_PROMPT_DONE, 'true');
  } catch (error) {
    if (__DEV__) console.warn('[handoffStore] could not persist the paste-screen flag:', error);
  }
}

// SPEC-20 R5 — launch routing. Splash decides, on every cold launch, where a
// user goes. Two rules carry the weight:
//
//  - A signed-in user goes through Loading (the gate), never straight to
//    Root (INVARIANTS #1) — but only after their saved answers are back in
//    the store. Skipping that load let a user who quit mid-questionnaire pay
//    with an empty profile (2026-09-15), and stranded a failed save's answers
//    on disk where Loading's re-save could never find them.
//  - A resumed questionnaire restores the whole path, not one screen, or
//    Back does nothing (the "dead back button", 2026-09-09).
//
// The routing decisions themselves (resolveSignedInLaunch, resolveResumeStack)
// are tested in routingPolicy.test; these test that Splash loads, waits and
// acts on them. AsyncStorage is the global fake.

import React from 'react';
import { render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen } from '../SplashScreen';
import { useAuthStore } from '../../../store/authStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { STORAGE_KEYS } from '../../../constants/storageKeys';
import { asNavigationProp, makeNavigation } from '../../../test/navigation';
import { FIXTURE_HANDOFF_KEY, handoffLink, makeUser, onboardingAnswers } from '../../../test/factories';
import { useHandoffStore } from '../../../store/handoffStore';
import { clipboardModule, copyToClipboard, resetClipboardFake } from '../../../test/clipboard';
import { seedAuthStore, seedOnboardingStore } from '../../../test/stores';
import { advance } from '../../../test/timers';

type Props = React.ComponentProps<typeof SplashScreen>;

const userA = makeUser('user-a');
const SPLASH_MS = 2000;

/** Where the user was, as the questionnaire persists it. */
async function persisted({
  lastScreen,
  reachedAuth = false,
  answers = false,
}: {
  lastScreen?: string;
  reachedAuth?: boolean;
  answers?: boolean;
}) {
  if (lastScreen) await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_LAST_SCREEN, lastScreen);
  if (reachedAuth) await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_HAS_REACHED_AUTH, 'true');
  if (answers) {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(onboardingAnswers()));
  }
}

async function launch() {
  const navigation = makeNavigation();
  // What the store holds at the moment Splash routes — the point of the
  // "load before you route" rule.
  const userTypeWhenRouted: (string | null)[] = [];
  const snapshot = () => userTypeWhenRouted.push(useOnboardingStore.getState().userType);
  navigation.replace.mockImplementation(snapshot);
  navigation.reset.mockImplementation(snapshot);

  await render(
    <SplashScreen
      navigation={asNavigationProp<Props['navigation']>(navigation)}
      route={{ key: 'Splash', name: 'Splash' } as Props['route']}
    />,
  );
  await advance(SPLASH_MS);
  return { navigation, userTypeWhenRouted };
}

const stackOf = (...names: string[]) => ({
  index: names.length - 1,
  routes: names.map((name) => ({ name })),
});

beforeEach(async () => {
  jest.useFakeTimers();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  await AsyncStorage.clear();
  seedOnboardingStore(); // a cold launch: nothing in memory
  seedAuthStore({ isLoading: false });
  resetClipboardFake();
  useHandoffStore.setState({ pendingKey: null, pendingSource: null });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('signed in — always through the gate, never straight to Root', () => {
  beforeEach(() => seedAuthStore({ user: userA, isLoading: false }));

  it('no questionnaire on this device → the gate', async () => {
    const { navigation } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Loading');
    expect(navigation.replace).not.toHaveBeenCalledWith('Root');
  });

  it('quit mid-questionnaire → resumes it, answers reloaded BEFORE routing (2026-09-15)', async () => {
    await persisted({ lastScreen: 'NameAge', answers: true });
    const { navigation, userTypeWhenRouted } = await launch();
    expect(navigation.reset).toHaveBeenCalledWith(stackOf('Welcome', 'UserType', 'NameAge'));
    expect(userTypeWhenRouted).toEqual(['parent']);
    expect(navigation.replace).not.toHaveBeenCalledWith('Loading');
  });

  // The launch-time re-save: a failed profile save leaves the answers on
  // disk; Loading only re-sends what is in the store when it mounts.
  it('finished the questionnaire but the save failed → answers reloaded BEFORE the gate', async () => {
    await persisted({ lastScreen: 'EmotionalChallenges', reachedAuth: true, answers: true });
    const { navigation, userTypeWhenRouted } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Loading');
    expect(userTypeWhenRouted).toEqual(['parent']);
  });

  it('a saved screen this build no longer has → the gate, not a broken resume', async () => {
    await persisted({ lastScreen: 'VBName' });
    const { navigation } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Loading');
    expect(navigation.reset).not.toHaveBeenCalled();
  });
});

describe('signed out', () => {
  it('reached the sign-in screen before → back to Auth, answers reloaded', async () => {
    await persisted({ lastScreen: 'EmotionalChallenges', reachedAuth: true, answers: true });
    const { navigation, userTypeWhenRouted } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Auth');
    expect(userTypeWhenRouted).toEqual(['parent']);
  });

  it('mid-questionnaire → the whole path back to that screen, so Back works (2026-09-09)', async () => {
    await persisted({ lastScreen: 'ChildrenCount', answers: true });
    const { navigation } = await launch();
    expect(navigation.reset).toHaveBeenCalledWith(
      stackOf('Welcome', 'UserType', 'NameAge', 'ChildrenCount'),
    );
  });

  it('a saved screen this build no longer has → Welcome', async () => {
    await persisted({ lastScreen: 'VBName' });
    const { navigation } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Welcome');
  });

  it('first open → Welcome', async () => {
    const { navigation } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Welcome');
  });
});

describe('timing', () => {
  it('waits for auth to finish loading, then shows the splash for 2 s', async () => {
    seedAuthStore({ user: userA, isLoading: true });
    const navigation = makeNavigation();
    await render(
      <SplashScreen
        navigation={asNavigationProp<Props['navigation']>(navigation)}
        route={{ key: 'Splash', name: 'Splash' } as Props['route']}
      />,
    );
    await advance(5000);
    expect(navigation.replace).not.toHaveBeenCalled();

    useAuthStore.setState({ isLoading: false });
    await advance(SPLASH_MS - 50);
    expect(navigation.replace).not.toHaveBeenCalled();
    await advance(50);
    expect(navigation.replace).toHaveBeenCalledWith('Loading');
  });
});

// SPEC-21 — the purchase handoff comes before the ordinary launch decisions,
// and the paste offer only ever meets a fresh install.
describe('the purchase handoff', () => {
  it('a handoff link opened the app → Handoff, before anything else (signed out)', async () => {
    useHandoffStore.getState().receive(FIXTURE_HANDOFF_KEY, 'link');
    await persisted({ lastScreen: 'NameAge' });
    const { navigation } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Handoff');
    expect(navigation.reset).not.toHaveBeenCalled();
  });

  it('a handoff link opened the app while signed in → Handoff, which deals with the account', async () => {
    seedAuthStore({ user: userA, isLoading: false });
    useHandoffStore.getState().receive(FIXTURE_HANDOFF_KEY, 'link');
    const { navigation } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Handoff');
    expect(navigation.replace).not.toHaveBeenCalledWith('Loading');
  });

  it('a fresh install with a link on the clipboard → the paste offer, before Welcome', async () => {
    copyToClipboard(handoffLink());
    const { navigation } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Handoff');
    expect(navigation.replace).not.toHaveBeenCalledWith('Welcome');
    // Asked whether there is a URL; never read (that would raise the alert).
    expect(clipboardModule.getStringAsync).not.toHaveBeenCalled();
  });

  it('a fresh install with no URL on the clipboard → Welcome', async () => {
    copyToClipboard('some words');
    const { navigation } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Welcome');
    expect(clipboardModule.hasUrlAsync).toHaveBeenCalledTimes(1);
  });

  it('the offer already answered → Welcome, and the clipboard is not even asked', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.HANDOFF_PROMPT_DONE, 'true');
    copyToClipboard(handoffLink());
    const { navigation } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Welcome');
    expect(clipboardModule.hasUrlAsync).not.toHaveBeenCalled();
  });

  it('partway through the questions with a link on the clipboard → their resume, not the offer', async () => {
    await persisted({ lastScreen: 'NameAge', answers: true });
    copyToClipboard(handoffLink());
    const { navigation } = await launch();
    expect(navigation.reset).toHaveBeenCalledWith(stackOf('Welcome', 'UserType', 'NameAge'));
    expect(navigation.replace).not.toHaveBeenCalledWith('Handoff');
    expect(clipboardModule.hasUrlAsync).not.toHaveBeenCalled();
  });

  it('reached the sign-in screen, link on the clipboard → back to Auth', async () => {
    await persisted({ lastScreen: 'EmotionalChallenges', reachedAuth: true });
    copyToClipboard(handoffLink());
    const { navigation } = await launch();
    expect(navigation.replace).toHaveBeenCalledWith('Auth');
  });

  it('a signed-in launch marks the install as not fresh — the offer never shows after a later sign-out', async () => {
    seedAuthStore({ user: userA, isLoading: false });
    await launch();
    expect(await AsyncStorage.getItem(STORAGE_KEYS.HANDOFF_PROMPT_DONE)).toBe('true');
  });
});

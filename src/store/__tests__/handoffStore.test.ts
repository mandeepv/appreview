// SPEC-21 — the handoff's in-memory key and greeting, and the one flag on
// disk. The key is a login credential (INVARIANTS #29): it is held until
// HandoffScreen takes it, once, and never written anywhere.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isHandoffPromptDone, markHandoffPromptDone, useHandoffStore } from '../handoffStore';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { FIXTURE_HANDOFF_KEY as KEY } from '../../test/factories';

beforeEach(async () => {
  useHandoffStore.setState({ pendingKey: null, pendingSource: null, greetingPending: false });
  await AsyncStorage.clear();
});

afterEach(() => jest.restoreAllMocks());

describe('the pending key', () => {
  it('is taken exactly once', () => {
    useHandoffStore.getState().receive(KEY, 'link');
    expect(useHandoffStore.getState().take()).toEqual({ key: KEY, source: 'link' });
    expect(useHandoffStore.getState().take()).toBeNull();
    expect(useHandoffStore.getState().pendingKey).toBeNull();
  });

  it('a newer key replaces an older one', () => {
    useHandoffStore.getState().receive('old-key', 'clipboard');
    useHandoffStore.getState().receive(KEY, 'link');
    expect(useHandoffStore.getState().take()).toEqual({ key: KEY, source: 'link' });
  });

  it('is never written to disk', async () => {
    useHandoffStore.getState().receive(KEY, 'clipboard');
    const everything = await AsyncStorage.multiGet(await AsyncStorage.getAllKeys());
    expect(JSON.stringify(everything)).not.toContain(KEY);
  });
});

describe('the greeting', () => {
  it('is consumed once', () => {
    expect(useHandoffStore.getState().consumeGreeting()).toBe(false);
    useHandoffStore.getState().setGreetingPending();
    expect(useHandoffStore.getState().consumeGreeting()).toBe(true);
    expect(useHandoffStore.getState().consumeGreeting()).toBe(false);
  });
});

describe('the paste-screen flag', () => {
  it('starts unset, and stays set once marked', async () => {
    expect(await isHandoffPromptDone()).toBe(false);
    await markHandoffPromptDone();
    expect(await AsyncStorage.getItem(STORAGE_KEYS.HANDOFF_PROMPT_DONE)).toBe('true');
    expect(await isHandoffPromptDone()).toBe(true);
  });

  it('a read failure counts as done — better to skip the offer than to show it wrongly', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk'));
    expect(await isHandoffPromptDone()).toBe(true);
  });

  it('a write failure never throws', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));
    await expect(markHandoffPromptDone()).resolves.toBeUndefined();
  });
});

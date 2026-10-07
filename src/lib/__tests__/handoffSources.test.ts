// SPEC-21 — where handoff keys come from.
//
//  - Links: the URL that launched the app and any that open it later. Only a
//    handoff link's key reaches the store; the Google sign-in redirect and
//    everything else are ignored.
//  - The clipboard: asked only whether it holds a URL (no iOS paste alert),
//    read only from a tap, cleared after a pasted link is redeemed.
//
// expo-clipboard is the global fake (src/test/clipboard.tsx); Linking is
// React Native's own Jest mock, programmed here.

import { Linking, Platform } from 'react-native';
import {
  clearPastedLink,
  clipboardMayHoldLink,
  handoffLaunchLinkRead,
  listenForHandoffLinks,
  pasteButtonAvailable,
  readClipboardText,
} from '../handoffSources';
import { useHandoffStore } from '../../store/handoffStore';
import { clipboard, clipboardModule, copyToClipboard, resetClipboardFake } from '../../test/clipboard';
import { FIXTURE_HANDOFF_KEY as KEY, handoffLink } from '../../test/factories';

let urlListener: ((event: { url: string }) => void) | undefined;
const removeListener = jest.fn();

beforeEach(() => {
  useHandoffStore.setState({ pendingKey: null, pendingSource: null });
  resetClipboardFake();
  urlListener = undefined;
  removeListener.mockClear();
  jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
  jest.spyOn(Linking, 'addEventListener').mockImplementation(((_type: string, listener: (event: { url: string }) => void) => {
    urlListener = listener;
    return { remove: removeListener };
  }) as unknown as typeof Linking.addEventListener);
});

afterEach(() => {
  jest.restoreAllMocks();
  Platform.OS = 'ios';
});

describe('links', () => {
  it('a handoff link launched the app → its key is pending, and onLink runs', async () => {
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(handoffLink(KEY, 'universal'));
    const onLink = jest.fn();
    listenForHandoffLinks(onLink);
    await handoffLaunchLinkRead();
    expect(useHandoffStore.getState().take()).toEqual({ key: KEY, source: 'link' });
    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it('a handoff link opens the app while it runs → the same', () => {
    const onLink = jest.fn();
    listenForHandoffLinks(onLink);
    urlListener!({ url: handoffLink(KEY, 'scheme') });
    expect(useHandoffStore.getState().pendingKey).toBe(KEY);
    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it('any other URL (the Google sign-in redirect) is ignored', async () => {
    (Linking.getInitialURL as jest.Mock).mockResolvedValue('kinderwell://auth/callback?code=abc');
    const onLink = jest.fn();
    listenForHandoffLinks(onLink);
    await handoffLaunchLinkRead();
    urlListener!({ url: 'https://kinderwell.app/welcome' });
    expect(useHandoffStore.getState().pendingKey).toBeNull();
    expect(onLink).not.toHaveBeenCalled();
  });

  it('a launch URL that cannot be read → nothing pending, no crash', async () => {
    (Linking.getInitialURL as jest.Mock).mockRejectedValue(new Error('no activity'));
    listenForHandoffLinks(jest.fn());
    await handoffLaunchLinkRead();
    expect(useHandoffStore.getState().pendingKey).toBeNull();
  });

  it('the returned function stops listening', () => {
    listenForHandoffLinks(jest.fn())();
    expect(removeListener).toHaveBeenCalledTimes(1);
  });

  it('a launch never waits long on the launch URL', async () => {
    jest.useFakeTimers();
    try {
      (Linking.getInitialURL as jest.Mock).mockReturnValue(new Promise(() => {}));
      listenForHandoffLinks(jest.fn());
      const read = handoffLaunchLinkRead(1000);
      let done = false;
      void read.then(() => (done = true));
      await jest.advanceTimersByTimeAsync(999);
      expect(done).toBe(false);
      await jest.advanceTimersByTimeAsync(1);
      expect(done).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('the clipboard', () => {
  it('a URL on it → maybe ours; asked without reading it', async () => {
    copyToClipboard(handoffLink());
    expect(await clipboardMayHoldLink()).toBe(true);
    expect(clipboardModule.getStringAsync).not.toHaveBeenCalled();
  });

  it('no URL → no', async () => {
    copyToClipboard('just some words');
    expect(await clipboardMayHoldLink()).toBe(false);
  });

  it('not an iPhone → never asked', async () => {
    Platform.OS = 'android';
    copyToClipboard(handoffLink());
    expect(await clipboardMayHoldLink()).toBe(false);
    expect(clipboardModule.hasUrlAsync).not.toHaveBeenCalled();
  });

  it('the native check failing → no', async () => {
    clipboardModule.hasUrlAsync.mockRejectedValueOnce(new Error('native'));
    expect(await clipboardMayHoldLink()).toBe(false);
  });

  it('the Paste button is available exactly when iOS says so', () => {
    expect(pasteButtonAvailable()).toBe(true);
    clipboard.pasteButtonAvailable = false;
    expect(pasteButtonAvailable()).toBe(false);
  });

  it('the iOS 15 fallback reads the text, or null when it cannot', async () => {
    copyToClipboard(handoffLink());
    expect(await readClipboardText()).toBe(handoffLink());
    clipboardModule.getStringAsync.mockRejectedValueOnce(new Error('denied'));
    expect(await readClipboardText()).toBeNull();
  });

  it('a redeemed, pasted link is taken off the clipboard — by writing, never reading', async () => {
    copyToClipboard(handoffLink());
    await clearPastedLink();
    expect(clipboard.text).toBe('');
    expect(clipboardModule.getStringAsync).not.toHaveBeenCalled();
  });

  it('clearing failing never throws', async () => {
    clipboardModule.setStringAsync.mockRejectedValueOnce(new Error('native'));
    await expect(clearPastedLink()).resolves.toBeUndefined();
  });
});

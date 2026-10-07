// SPEC-21 purchase handoff — where keys come from: a link that opens the app,
// and the clipboard. Kept outside navigation (App.tsx wires it in), so the
// key reaches HandoffScreen through the in-memory store, never as a route
// param.
//
// THE CLIPBOARD RULE. Reading the clipboard makes iOS 16+ show "Kinderwell
// would like to paste from Safari". So nothing here reads it without the
// parent asking: hasUrlAsync() only asks whether a URL is there (no alert),
// Apple's Paste button (UIPasteControl, on HandoffScreen) reads it with no
// alert because the tap IS the permission, and readClipboardText — the
// fallback for iOS 15, which has no Paste button — runs only from a tap.

import { Linking, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { parseHandoffUrl } from './handoffLink';
import { useHandoffStore } from '../store/handoffStore';

let launchLinkRead: Promise<void> = Promise.resolve();

/**
 * Listen for handoff links: the URL that launched the app (cold start) and
 * any that open it while it runs (warm). A handoff link's key goes into the
 * store, then `onLink` runs so the caller can bring HandoffScreen up. Every
 * other URL — the Google sign-in redirect included — is ignored.
 * Returns the unsubscribe.
 */
export function listenForHandoffLinks(onLink: () => void): () => void {
  const handle = (url: string | null) => {
    const key = parseHandoffUrl(url);
    if (!key) return;
    useHandoffStore.getState().receive(key, 'link');
    onLink();
  };
  launchLinkRead = Linking.getInitialURL().then(handle, () => {});
  const subscription = Linking.addEventListener('url', ({ url }) => handle(url));
  return () => subscription.remove();
}

/**
 * Resolves once the launch URL has been read, so Splash can tell a cold
 * start from a handoff link before it routes. Capped, so a launch never
 * waits long on it: a link read after the cap still lands through
 * listenForHandoffLinks' onLink.
 */
export function handoffLaunchLinkRead(timeoutMs = 1000): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cap = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs);
  });
  return Promise.race([launchLinkRead, cap]).finally(() => clearTimeout(timer));
}

/**
 * Might the clipboard hold a handoff link? Asks only whether it holds a URL,
 * which shows no paste alert — which URL is unknowable until the parent taps
 * Paste. iOS only: the handoff is an iPhone flow.
 */
export async function clipboardMayHoldLink(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await Clipboard.hasUrlAsync();
  } catch {
    return false;
  }
}

/** Apple's Paste button exists from iOS 16; before that, a plain button reads instead. */
export function pasteButtonAvailable(): boolean {
  return Clipboard.isPasteButtonAvailable;
}

/** The iOS 15 fallback: read the clipboard from a tap (iOS asks first). Null on failure. */
export async function readClipboardText(): Promise<string | null> {
  try {
    return await Clipboard.getStringAsync();
  } catch {
    return null;
  }
}

/**
 * Take a redeemed, pasted link off the clipboard. Only ever called right
 * after the parent pasted it, so it is still ours: checking would mean
 * reading, and reading shows the alert. Writing shows nothing.
 */
export async function clearPastedLink(): Promise<void> {
  try {
    await Clipboard.setStringAsync('');
  } catch {
    // A used key on the clipboard is harmless: it can't sign anyone in again.
  }
}

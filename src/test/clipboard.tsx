// A programmable fake of expo-clipboard (SPEC-21). setup.ts installs it for
// every file: the real module is native, and its Paste button is Apple's
// UIPasteControl, which has no JavaScript side to render in Jest.
//
// `clipboard` is what the device's clipboard holds. The fake Paste button is
// a plain pressable that hands it over the way UIPasteControl does
// ({ type: 'text', text }); hasUrlAsync answers from `hasUrl` without
// "reading", as on iOS.

import React from 'react';
import { Pressable, Text } from 'react-native';

export const clipboard = {
  hasUrl: false,
  text: '',
  pasteButtonAvailable: true,
};

type PasteButtonProps = {
  onPress: (data: { type: 'text'; text: string }) => void;
  testID?: string;
};

function FakePasteButton({ onPress, testID }: PasteButtonProps) {
  return (
    <Pressable testID={testID} accessibilityRole="button" onPress={() => onPress({ type: 'text', text: clipboard.text })}>
      <Text>Paste</Text>
    </Pressable>
  );
}

export const clipboardModule = {
  hasUrlAsync: jest.fn(() => Promise.resolve(clipboard.hasUrl)),
  getStringAsync: jest.fn(() => Promise.resolve(clipboard.text)),
  setStringAsync: jest.fn((text: string) => {
    clipboard.text = text;
    clipboard.hasUrl = false;
    return Promise.resolve(true);
  }),
  get isPasteButtonAvailable() {
    return clipboard.pasteButtonAvailable;
  },
  ClipboardPasteButton: FakePasteButton,
};

/** An empty clipboard, Paste button available, mocks cleared. */
export function resetClipboardFake(): void {
  clipboard.hasUrl = false;
  clipboard.text = '';
  clipboard.pasteButtonAvailable = true;
  clipboardModule.hasUrlAsync.mockClear();
  clipboardModule.getStringAsync.mockClear();
  clipboardModule.setStringAsync.mockClear();
}

/** Put a link on the clipboard, as the welcome page's "Get Kinderwell" does. */
export function copyToClipboard(text: string): void {
  clipboard.text = text;
  clipboard.hasUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(text);
}

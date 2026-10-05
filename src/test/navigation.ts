// A fake `navigation` prop (SPEC-20 R2). Screens receive navigation as a
// prop, so a screen test passes this instead of mounting a navigator, then
// asserts where the screen tried to go.

export function makeNavigation() {
  return {
    replace: jest.fn(),
    reset: jest.fn(),
    navigate: jest.fn(),
    push: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(() => false),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    getState: jest.fn(() => ({ routes: [], index: 0 })),
  };
}

export type FakeNavigation = ReturnType<typeof makeNavigation>;

/**
 * Cast for a screen's `navigation` prop. The fake implements only what
 * screens call; the full NativeStackNavigationProp type is far larger.
 */
export function asNavigationProp<T>(navigation: FakeNavigation): T {
  return navigation as unknown as T;
}

// Render a screen the way the navigator would (SPEC-20 R2): its fake
// navigation passed as the `navigation` prop AND provided as context, so a
// component inside it that calls useNavigation() — OnboardingScreen does —
// gets the same fake, and a test can assert on every navigation the screen
// makes, whichever way it reaches the navigator.

import React from 'react';
import { NavigationContext } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import { makeNavigation, type FakeNavigation } from './navigation';

export async function renderScreen<P>(
  Screen: React.ComponentType<P>,
  route: { name: string; params?: object },
  navigation: FakeNavigation = makeNavigation(),
): Promise<FakeNavigation> {
  const props = { navigation, route: { key: route.name, ...route } } as unknown as P;
  await render(
    <NavigationContext.Provider value={navigation as never}>
      <Screen {...(props as P & React.JSX.IntrinsicAttributes)} />
    </NavigationContext.Provider>,
  );
  return navigation;
}

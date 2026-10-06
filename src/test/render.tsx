// Render a screen the way the navigator would (SPEC-20 R2): its fake
// navigation and its route passed as props AND provided as context, so a
// screen or child that calls useNavigation() / useRoute() — OnboardingScreen
// and LessonScreen do — gets the same objects, and a test can assert on every
// navigation the screen makes, whichever way it reaches the navigator.

import React from 'react';
import { NavigationContext, NavigationRouteContext } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import { makeNavigation, type FakeNavigation } from './navigation';

export async function renderScreen<P>(
  Screen: React.ComponentType<P>,
  route: { name: string; params?: object },
  navigation: FakeNavigation = makeNavigation(),
): Promise<FakeNavigation> {
  const fullRoute = { key: route.name, ...route };
  const props = { navigation, route: fullRoute } as unknown as P;
  await render(
    <NavigationContext.Provider value={navigation as never}>
      <NavigationRouteContext.Provider value={fullRoute as never}>
        <Screen {...(props as P & React.JSX.IntrinsicAttributes)} />
      </NavigationRouteContext.Provider>
    </NavigationContext.Provider>,
  );
  return navigation;
}

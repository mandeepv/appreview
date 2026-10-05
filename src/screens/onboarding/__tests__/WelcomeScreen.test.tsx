import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { WelcomeScreen } from '../WelcomeScreen';
import { asNavigationProp, makeNavigation } from '../../../test/navigation';
import { capturedEvents, resetAnalyticsFakes } from '../../../test/analytics';

type Props = React.ComponentProps<typeof WelcomeScreen>;

async function renderWelcome() {
  const navigation = makeNavigation();
  await render(
    <WelcomeScreen
      navigation={asNavigationProp<Props['navigation']>(navigation)}
      route={{ key: 'Welcome', name: 'Welcome' } as Props['route']}
    />,
  );
  return navigation;
}

beforeEach(() => resetAnalyticsFakes());

// INVARIANTS #27: kinderwell.app's /welcome page and its emails quote these
// labels word for word, telling web buyers what to tap. Changing one here
// strands them on a screen that doesn't match the instructions — change the
// website in the same release, then update this test.
describe('WelcomeScreen labels the website quotes (INVARIANTS #27)', () => {
  it.each(['Get started', 'Already have an account?', 'Sign in'])('shows exactly "%s"', async (label) => {
    await renderWelcome();
    expect(screen.getByText(label)).toBeTruthy();
  });
});

describe('WelcomeScreen routing', () => {
  it('Get started → the questionnaire', async () => {
    const navigation = await renderWelcome();
    await fireEvent.press(screen.getByText('Get started'));
    expect(navigation.navigate).toHaveBeenCalledWith('UserType');
    expect(capturedEvents()).toContain('welcome_cta_tapped');
  });

  it('Sign in → Auth in signin mode, never the questionnaire', async () => {
    const navigation = await renderWelcome();
    await fireEvent.press(screen.getByText('Sign in'));
    expect(navigation.navigate).toHaveBeenCalledWith('Auth', { mode: 'signin' });
    expect(navigation.navigate).not.toHaveBeenCalledWith('UserType');
  });
});

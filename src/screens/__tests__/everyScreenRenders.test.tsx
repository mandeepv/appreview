// SPEC-20 R7 — every screen mounts. Cheap insurance against the crashes no
// focused test happens to reach: an import that throws, a read of a field a
// new state shape no longer has, a missing provider. Each screen renders with
// a signed-in user and a resolved config; the screens with their own test
// files check behaviour, this checks only that nothing throws on the way in.
//
// The completeness check fails when a screen file is added without a row
// here, so the table can't silently fall behind.

import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { act, screen } from '@testing-library/react-native';
import { LessonHubScreen } from '../../lessons/LessonHubScreen';
import { LessonPreviewRoute } from '../../lessons/LessonPreviewRoute';
import { LessonPreviewScreen } from '../../lessons/LessonPreviewScreen';
import { LessonScreen } from '../../lessons/LessonScreen';
import { HUB_META } from '../../lessons/hubMeta';
import { getLesson } from '../../lessons/registry';
import CommunicationMistakesLessonScreen from '../CommunicationMistakesLessonScreen';
import { DevMenuScreen } from '../DevMenuScreen';
import DissociationLessonScreen from '../DissociationLessonScreen';
import EmotionalSandbagsLessonScreen from '../EmotionalSandbagsLessonScreen';
import HelpingSomeoneProcessEmotionsLessonScreen from '../HelpingSomeoneProcessEmotionsLessonScreen';
import LabelingEmotionsLessonScreen from '../LabelingEmotionsLessonScreen';
import LearnScreen from '../LearnScreen';
import { Lesson5Complete } from '../Lesson5Complete';
import NamingOurEmotionsLessonScreen from '../NamingOurEmotionsLessonScreen';
import RecordingDeepBondMomentsLessonScreen from '../RecordingDeepBondMomentsLessonScreen';
import ServeAndReturnLessonScreen from '../ServeAndReturnLessonScreen';
import { SettingsScreen } from '../SettingsScreen';
import SprinklersLessonScreen from '../SprinklersLessonScreen';
import { AuthScreen } from '../onboarding/AuthScreen';
import { ChildrenCountScreen } from '../onboarding/ChildrenCountScreen';
import { EducationalScreen } from '../onboarding/EducationalScreen';
import { EmotionalChallengesScreen } from '../onboarding/EmotionalChallengesScreen';
import { ExperienceLevelScreen } from '../onboarding/ExperienceLevelScreen';
import { HandoffScreen } from '../onboarding/HandoffScreen';
import { ImprovementGoalsScreen } from '../onboarding/ImprovementGoalsScreen';
import { LoadingScreen } from '../onboarding/LoadingScreen';
import { NameAgeScreen } from '../onboarding/NameAgeScreen';
import { PartnerInvolvementScreen } from '../onboarding/PartnerInvolvementScreen';
import { SplashScreen } from '../onboarding/SplashScreen';
import { UserTypeScreen } from '../onboarding/UserTypeScreen';
import { WelcomeScreen } from '../onboarding/WelcomeScreen';
import { renderScreen } from '../../test/render';
import { makeSession, makeUser } from '../../test/factories';
import { seedAuthStore, seedConfigStore, seedOnboardingStore } from '../../test/stores';

type Row = { Screen: React.ComponentType<any>; route: { name: string; params?: object } };

// Components that take a lesson as props rather than being navigator screens.
const sprinklers = getLesson('sprinklers')!;
const HubForSprinklers = () => (
  <LessonHubScreen lesson={sprinklers} meta={HUB_META.sprinklers} onBack={() => {}} onOpenSection={() => {}} />
);
const PreviewForSprinklers = () => <LessonPreviewScreen slug="sprinklers" onExit={() => {}} />;

const SCREENS: Record<string, Row> = {
  'src/lessons/LessonHubScreen.tsx': { Screen: HubForSprinklers, route: { name: 'LessonHub' } },
  'src/lessons/LessonPreviewScreen.tsx': { Screen: PreviewForSprinklers, route: { name: 'LessonPreview' } },
  'src/lessons/LessonPreviewRoute.tsx': {
    Screen: LessonPreviewRoute,
    route: { name: 'LessonPreview', params: { slug: 'sprinklers' } },
  },
  'src/lessons/LessonScreen.tsx': {
    Screen: LessonScreen,
    route: { name: 'LessonScreen', params: { lessonId: 'sprinklers', sectionIndex: 0, screenIndex: 0, entry: true } },
  },
  'src/screens/CommunicationMistakesLessonScreen.tsx': { Screen: CommunicationMistakesLessonScreen, route: { name: 'CommunicationMistakesLesson' } },
  'src/screens/DevMenuScreen.tsx': { Screen: DevMenuScreen, route: { name: 'DevMenu' } },
  'src/screens/DissociationLessonScreen.tsx': { Screen: DissociationLessonScreen, route: { name: 'DissociationLesson' } },
  'src/screens/EmotionalSandbagsLessonScreen.tsx': { Screen: EmotionalSandbagsLessonScreen, route: { name: 'EmotionalSandbagsLesson' } },
  'src/screens/HelpingSomeoneProcessEmotionsLessonScreen.tsx': {
    Screen: HelpingSomeoneProcessEmotionsLessonScreen,
    route: { name: 'HelpingSomeoneProcessEmotionsLesson' },
  },
  'src/screens/LabelingEmotionsLessonScreen.tsx': { Screen: LabelingEmotionsLessonScreen, route: { name: 'LabelingEmotionsLesson' } },
  'src/screens/LearnScreen.tsx': { Screen: LearnScreen, route: { name: 'Learn' } },
  'src/screens/Lesson5Complete.tsx': { Screen: Lesson5Complete, route: { name: 'Lesson5Complete' } },
  'src/screens/NamingOurEmotionsLessonScreen.tsx': { Screen: NamingOurEmotionsLessonScreen, route: { name: 'NamingOurEmotionsLesson' } },
  'src/screens/RecordingDeepBondMomentsLessonScreen.tsx': {
    Screen: RecordingDeepBondMomentsLessonScreen,
    route: { name: 'RecordingDeepBondMomentsLesson' },
  },
  'src/screens/ServeAndReturnLessonScreen.tsx': { Screen: ServeAndReturnLessonScreen, route: { name: 'ServeAndReturnLesson' } },
  'src/screens/SettingsScreen.tsx': { Screen: SettingsScreen, route: { name: 'Settings' } },
  'src/screens/SprinklersLessonScreen.tsx': { Screen: SprinklersLessonScreen, route: { name: 'SprinklersLesson' } },
  'src/screens/onboarding/AuthScreen.tsx': { Screen: AuthScreen, route: { name: 'Auth', params: { mode: 'signup' } } },
  'src/screens/onboarding/ChildrenCountScreen.tsx': { Screen: ChildrenCountScreen, route: { name: 'ChildrenCount' } },
  'src/screens/onboarding/EducationalScreen.tsx': { Screen: EducationalScreen, route: { name: 'Educational' } },
  'src/screens/onboarding/EmotionalChallengesScreen.tsx': { Screen: EmotionalChallengesScreen, route: { name: 'EmotionalChallenges' } },
  'src/screens/onboarding/ExperienceLevelScreen.tsx': { Screen: ExperienceLevelScreen, route: { name: 'ExperienceLevel' } },
  'src/screens/onboarding/HandoffScreen.tsx': { Screen: HandoffScreen, route: { name: 'Handoff' } },
  'src/screens/onboarding/ImprovementGoalsScreen.tsx': { Screen: ImprovementGoalsScreen, route: { name: 'ImprovementGoals' } },
  'src/screens/onboarding/LoadingScreen.tsx': { Screen: LoadingScreen, route: { name: 'Loading' } },
  'src/screens/onboarding/NameAgeScreen.tsx': { Screen: NameAgeScreen, route: { name: 'NameAge' } },
  'src/screens/onboarding/PartnerInvolvementScreen.tsx': { Screen: PartnerInvolvementScreen, route: { name: 'PartnerInvolvement' } },
  'src/screens/onboarding/SplashScreen.tsx': { Screen: SplashScreen, route: { name: 'Splash' } },
  'src/screens/onboarding/UserTypeScreen.tsx': { Screen: UserTypeScreen, route: { name: 'UserType' } },
  'src/screens/onboarding/WelcomeScreen.tsx': { Screen: WelcomeScreen, route: { name: 'Welcome' } },
};

const ROOT = path.join(__dirname, '..', '..', '..');
const screenFiles = [
  ...fs.readdirSync(path.join(ROOT, 'src/screens')).filter((f) => f.endsWith('.tsx')).map((f) => `src/screens/${f}`),
  ...fs.readdirSync(path.join(ROOT, 'src/screens/onboarding')).filter((f) => f.endsWith('.tsx')).map((f) => `src/screens/onboarding/${f}`),
  ...fs.readdirSync(path.join(ROOT, 'src/lessons')).filter((f) => /(Screen|Route)\.tsx$/.test(f)).map((f) => `src/lessons/${f}`),
];

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  const user = makeUser('user-a');
  seedAuthStore({ user, session: makeSession(user) });
  seedConfigStore();
  seedOnboardingStore();
});

afterEach(() => jest.restoreAllMocks());

it('every screen file has a row in this table', () => {
  expect(screenFiles.filter((file) => !(file in SCREENS))).toEqual([]);
  expect(Object.keys(SCREENS).filter((file) => !screenFiles.includes(file))).toEqual([]);
});

it.each(Object.keys(SCREENS))('%s mounts and draws something', async (file) => {
  const { Screen, route } = SCREENS[file];
  await renderScreen(Screen, route);
  await act(async () => {}); // let mount-time reads settle
  expect(screen.toJSON()).not.toBeNull();
});

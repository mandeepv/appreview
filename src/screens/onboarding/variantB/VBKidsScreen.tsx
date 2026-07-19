import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { ChildrenCountScreen } from '../ChildrenCountScreen';
import { VB } from './variantBContent';

// ACT 2 — "tell us about your kids". Reuses the variant-A compound picker
// verbatim (same store fields `childrenCount`/`children[].ageRange`, same
// 'ChildrenCount' analytics step) — only the screenName (for progress/resume)
// and the next-target differ. The reused screen ignores the route mismatch:
// it navigates via the onDone override, never its own hardcoded target.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBKids'>;

export const VBKidsScreen: React.FC<Props> = ({ navigation, route }) => (
  <ChildrenCountScreen
    // The reused screen's Props type is pinned to the 'ChildrenCount' route, but
    // it only ever calls navigation.navigate/goBack (both globally typed) and,
    // with onDone provided, never its own target. The cast bridges the route-name
    // mismatch at this single, well-understood boundary.
    navigation={navigation as never}
    route={route as never}
    screenName={VB.Kids}
    onDone={() => navigation.navigate('VBMood')}
  />
);
